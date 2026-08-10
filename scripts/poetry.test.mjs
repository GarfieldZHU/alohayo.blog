import test from 'node:test'
import assert from 'node:assert/strict'
import { parseChinesePoem } from '../lib/poetry.ts'

test('parses the 诗泉 random-poem response', () => {
  const poem = parseChinesePoem({
    data: {
      title: '静夜思',
      content: ['床前明月光，', '疑是地上霜。'],
      author: { name: '李白' },
      dynasty: { name: '唐' },
      type: { name: '五言绝句' },
    },
  })

  assert.deepEqual(poem, {
    title: '静夜思',
    content: ['床前明月光，', '疑是地上霜。'],
    author: '李白',
    dynasty: '唐',
    type: '五言绝句',
  })
})

test('rejects an incomplete 诗泉 response', () => {
  assert.throws(() => parseChinesePoem({ data: { title: '没有正文' } }))
})
