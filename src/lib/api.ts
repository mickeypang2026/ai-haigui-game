import type { SessionPublic, Story, YesNoIrrelevant } from './types'

type ApiErrorBody = { message?: unknown }

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function toMessage(data: unknown): string {
  if (!data) return '请求失败'
  if (typeof data === 'string') return data
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const msg = (data as ApiErrorBody).message
    return typeof msg === 'string' && msg.trim() ? msg : '请求失败'
  }
  return '请求失败'
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(toMessage(data))
  }
  return data as T
}

export async function listStories(): Promise<Story[]> {
  return requestJson<Story[]>('/api/stories')
}

export async function createSession(params?: { storyId?: string }): Promise<{ id: string }> {
  return requestJson<{ id: string }>('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyId: params?.storyId,
    }),
  })
}

export async function getSession(id: string): Promise<SessionPublic> {
  return requestJson<SessionPublic>(`/api/session/${encodeURIComponent(id)}`)
}

export async function askQuestion(id: string, question: string): Promise<SessionPublic> {
  return requestJson<SessionPublic>(`/api/session/${encodeURIComponent(id)}/question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
}

export async function endSession(id: string): Promise<SessionPublic> {
  return requestJson<SessionPublic>(`/api/session/${encodeURIComponent(id)}/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
}

export async function submitFinalGuess(
  id: string,
  guess: string,
): Promise<{ truth: string; finalGuess: { guess: string; correct: boolean; createdAt: number } }> {
  return requestJson<{ truth: string; finalGuess: { guess: string; correct: boolean; createdAt: number } }>(
    `/api/session/${encodeURIComponent(id)}/final`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess }),
    },
  )
}

export function isYesNoIrrelevant(value: unknown): value is YesNoIrrelevant {
  return value === '是' || value === '否' || value === '无关'
}

