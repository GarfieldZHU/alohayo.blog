const MAX_INSTRUCTIONS = 64
const I32_MIN = -2147483648
const I32_MAX = 2147483647

export const DEFAULT_WAT = `(module
  (func (export "shade") (param i32) (result i32)
    local.get 0
    i32.const 7
    i32.mul
    i32.const 255
    i32.rem_u
  )
)`

const INSTRUCTIONS = {
  'i32.add': [0x6a, false],
  'i32.sub': [0x6b, false],
  'i32.mul': [0x6c, false],
  'i32.div_s': [0x6d, false],
  'i32.rem_s': [0x6f, false],
  'i32.rem_u': [0x70, false],
  'i32.and': [0x71, false],
  'i32.or': [0x72, false],
  'i32.xor': [0x73, false],
  'i32.shl': [0x74, false],
  'i32.shr_s': [0x75, false],
  'i32.shr_u': [0x76, false],
  'i32.rotl': [0x77, false],
  'i32.rotr': [0x78, false],
}

const tokenize = (source) => {
  if (typeof source !== 'string' || source.trim() === '') {
    throw new Error('Paste a small WAT module first.')
  }

  const withoutComments = source.replace(/;;[^\n]*/g, '')
  const tokens = withoutComments.match(/\(|\)|"[^"\n]*"|[-+]?\d+|[A-Za-z_.$][A-Za-z0-9_.$-]*/g)

  if (!tokens || tokens.join('').length !== withoutComments.replace(/\s+/g, '').length) {
    throw new Error('The editor contains a character this small runner does not understand.')
  }

  return tokens
}

class Parser {
  constructor(source) {
    this.tokens = tokenize(source)
    this.position = 0
  }

  peek() {
    return this.tokens[this.position]
  }

  next() {
    const token = this.peek()
    this.position += 1
    return token
  }

  expect(token, message = `Expected ${token}.`) {
    if (this.next() !== token) {
      throw new Error(message)
    }
  }

  parse() {
    this.expect('(', 'The module must start with `(module`.')
    this.expect('module', 'The module must start with `(module`.')

    if (this.peek() !== '(') {
      throw new Error('The tiny runner accepts one function only.')
    }

    this.expect('(')
    if (this.peek() === 'import') {
      throw new Error('Imports are not supported in the editable runner.')
    }
    this.expect('func', 'The module must contain one `(func ...)`.')

    this.expect('(', 'The function needs an `(export "shade")` clause.')
    this.expect('export')
    const exportName = this.next()
    this.expect(')')
    if (exportName !== '"shade"') {
      throw new Error('Export the function as `shade` so the playground can call it.')
    }

    this.expect('(', 'The function needs one `(param i32)` clause.')
    this.expect('param')
    const param = this.next()
    if (param !== 'i32' && param !== '$input') {
      throw new Error('The function parameter must be one i32 value.')
    }
    if (param === '$input') {
      this.expect('i32', 'The named parameter must have type i32.')
    }
    this.expect(')')

    this.expect('(', 'The function needs one `(result i32)` clause.')
    this.expect('result')
    this.expect('i32', 'The function result must be i32.')
    this.expect(')')

    const instructions = []
    while (this.peek() !== ')') {
      if (!this.peek()) {
        throw new Error('The function is missing its closing `)`.')
      }
      if (instructions.length >= MAX_INSTRUCTIONS) {
        throw new Error(`Keep the editable function under ${MAX_INSTRUCTIONS} instructions.`)
      }

      const instruction = this.next()
      if (instruction === 'local.get') {
        const index = this.next()
        if (index !== '0' && index !== '$input') {
          throw new Error('The only local value is parameter 0 (`local.get 0`).')
        }
        instructions.push(0x20, 0x00)
        continue
      }

      if (instruction === 'i32.const') {
        const value = Number(this.next())
        if (!Number.isInteger(value) || value < I32_MIN || value > I32_MAX) {
          throw new Error('i32.const expects a signed 32-bit integer.')
        }
        instructions.push(0x41, ...encodeSignedLeb(value))
        continue
      }

      const opcode = INSTRUCTIONS[instruction]
      if (!opcode) {
        throw new Error(`Unsupported instruction: ${instruction}`)
      }
      instructions.push(opcode[0])
    }

    this.expect(')')
    this.expect(')', 'The module is missing its closing `)`.')
    if (this.peek()) {
      throw new Error('Only one function is allowed in the editable module.')
    }

    return instructions
  }
}

const encodeUnsignedLeb = (value) => {
  const bytes = []
  let remaining = value >>> 0
  do {
    let byte = remaining & 0x7f
    remaining >>>= 7
    if (remaining !== 0) byte |= 0x80
    bytes.push(byte)
  } while (remaining !== 0)
  return bytes
}

const encodeSignedLeb = (value) => {
  const bytes = []
  let remaining = value | 0
  let more = true

  while (more) {
    const byte = remaining & 0x7f
    remaining >>= 7
    const signBitSet = (byte & 0x40) !== 0
    more = !((remaining === 0 && !signBitSet) || (remaining === -1 && signBitSet))
    bytes.push(more ? byte | 0x80 : byte)
  }

  return bytes
}

const section = (id, payload) => [id, ...encodeUnsignedLeb(payload.length), ...payload]

export const compileEditableWat = (source) => {
  const instructions = new Parser(source).parse()
  const typeSection = [1, 0x60, 1, 0x7f, 1, 0x7f]
  const functionSection = [1, 0]
  const exportName = Array.from(new TextEncoder().encode('shade'))
  const exportSection = [1, exportName.length, ...exportName, 0x00, 0x00]
  const body = [0x00, ...instructions, 0x0b]
  const codeSection = [1, ...encodeUnsignedLeb(body.length), ...body]
  const bytes = new Uint8Array([
    0x00,
    0x61,
    0x73,
    0x6d,
    0x01,
    0x00,
    0x00,
    0x00,
    ...section(1, typeSection),
    ...section(3, functionSection),
    ...section(7, exportSection),
    ...section(10, codeSection),
  ])

  if (!WebAssembly.validate(bytes)) {
    throw new Error('The instruction stack does not produce one i32 result.')
  }

  return bytes
}
