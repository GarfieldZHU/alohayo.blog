export const POETRY_RANDOM_ENDPOINT = 'https://poetry.palemoky.com/api/poems/random?lang=zh-Hans'

export interface ChinesePoem {
  title: string
  content: string[]
  author: string
  dynasty: string
  type: string
}

type PoetryApiPayload = {
  data?: {
    title?: unknown
    content?: unknown
    author?: { name?: unknown }
    dynasty?: { name?: unknown }
    type?: { name?: unknown }
  }
}

export function parseChinesePoem(payload: unknown): ChinesePoem {
  const data = (payload as PoetryApiPayload | null)?.data
  const content = Array.isArray(data?.content)
    ? data.content.filter((line): line is string => typeof line === 'string' && line.length > 0)
    : []

  if (
    typeof data?.title !== 'string' ||
    content.length === 0 ||
    typeof data.author?.name !== 'string' ||
    typeof data.dynasty?.name !== 'string'
  ) {
    throw new Error('The poetry response is missing the expected fields.')
  }

  return {
    title: data.title,
    content,
    author: data.author.name,
    dynasty: data.dynasty.name,
    type: typeof data.type?.name === 'string' ? data.type.name : '',
  }
}

export async function fetchRandomChinesePoem(): Promise<ChinesePoem> {
  const response = await fetch(POETRY_RANDOM_ENDPOINT, { cache: 'no-store' })
  if (!response.ok) throw new Error(`诗泉 responded with ${response.status}.`)
  return parseChinesePoem(await response.json())
}
