import test from 'node:test'
import assert from 'node:assert/strict'

import { compileEditableWat, DEFAULT_WAT } from '../lib/wasmWatRunner.mjs'

test('compiles the default editable program and returns its exported result', async () => {
  const bytes = compileEditableWat(DEFAULT_WAT)

  assert.equal(WebAssembly.validate(bytes), true)

  const { instance } = await WebAssembly.instantiate(bytes)
  assert.equal(instance.exports.shade(10), 70)
})

test('edits to the instruction stream change the wasm result', async () => {
  const source = DEFAULT_WAT.replace('i32.const 7', 'i32.const 3')
  const { instance } = await WebAssembly.instantiate(compileEditableWat(source))

  assert.equal(instance.exports.shade(10), 30)
})

test('rejects imports and unsupported instructions instead of running them', () => {
  assert.throws(
    () => compileEditableWat(DEFAULT_WAT.replace('(module', '(module (import "env" "run" (func))')),
    /only supports one exported function|imports are not supported/i
  )

  assert.throws(
    () => compileEditableWat(DEFAULT_WAT.replace('i32.mul', 'f32.sqrt')),
    /unsupported instruction/i
  )
})
