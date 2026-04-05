import type { Story, YesNoIrrelevant } from './types'

/**
 * AI 调用错误类型
 */
export class AIApiError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'AIApiError'
    this.statusCode = statusCode
  }
}

/**
 * 向 AI 提问并获取答案
 *
 * @param question - 玩家的问题
 * @param story - 故事信息（包含汤底）
 * @returns AI 的回答：是/否/无关
 */
export async function askAI(question: string, story: Story): Promise<YesNoIrrelevant> {
  const response = await fetch('/api/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      truth: story.bottom,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'AI 调用失败' }))
    throw new AIApiError(error.message, response.status)
  }

  const data = await response.json()

  // 验证返回值格式
  if (!isValidAnswer(data.answer)) {
    console.warn('[AI] Invalid answer format:', data.answer)
    return '无关' // 兜底策略
  }

  return data.answer
}

/**
 * 验证 AI 回答是否为有效值
 */
function isValidAnswer(answer: unknown): answer is YesNoIrrelevant {
  return answer === '是' || answer === '否' || answer === '无关'
}

/**
 * 提交最终猜测，让 AI 判断是否正确
 *
 * @param guess - 玩家的最终猜测
 * @param truth - 故事真相
 * @returns 猜测是否正确
 */
export async function judgeGuess(guess: string, truth: string): Promise<boolean> {
  const response = await fetch('/api/ai/judge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guess,
      truth,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '判定失败' }))
    throw new AIApiError(error.message, response.status)
  }

  const data = await response.json()
  return data.correct
}

export default { askAI, judgeGuess }
