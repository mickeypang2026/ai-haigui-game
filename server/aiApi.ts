import 'dotenv/config'
import express from 'express'
import type { YesNoIrrelevant } from './types'

const router = express.Router()

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const DEFAULT_MODEL = 'qwen-plus'

/**
 * 调用通义千问 API
 */
async function callQwenAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.QWEN_API_KEY
  const baseUrl = process.env.QWEN_BASE_URL || DEFAULT_BASE_URL
  const model = process.env.QWEN_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    throw new Error('AI API Key 未配置')
  }

  const apiUrl = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 10,
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `API 请求失败：${response.status}`

    try {
      const errorData = JSON.parse(errorText)
      if (errorData.error?.message) {
        errorMessage = errorData.error.message
      }
    } catch {
      // 忽略解析错误
    }

    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

/**
 * 解析 AI 回答，提取"是/否/无关"
 */
function parseAnswer(content: string): YesNoIrrelevant {
  // 直接匹配
  if (content === '是' || content === '否' || content === '无关') {
    return content as YesNoIrrelevant
  }

  // 尝试从回答中提取
  if (content.includes('是')) return '是'
  if (content.includes('否')) return '否'
  if (content.includes('无关')) return '无关'

  // 默认返回"无关"
  return '无关'
}

/**
 * POST /api/ai/ask
 * 向 AI 提问
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, truth } = req.body

    if (!question || !truth) {
      return res.status(400).json({ message: '缺少必要参数' })
    }

    const userPrompt = `你是一个海龟汤游戏的主持人。请根据以下"故事真相"判断玩家的问题。

【故事真相】
${truth}

【玩家问题】
${question}

请判断问题的答案，只能回答一个字：
- "是"：问题在故事真相的语义下可以判定为真
- "否"：问题在故事真相的语义下可以判定为假
- "无关"：问题无法从真相中推断，或者与关键事实无关

注意：严格只输出一个字："是"、"否"或"无关"`

    const answer = await callQwenAPI([
      { role: 'system', content: '你是一个海龟汤游戏主持人，只回答"是"、"否"或"无关"。' },
      { role: 'user', content: userPrompt },
    ])

    const parsedAnswer = parseAnswer(answer)
    res.json({ answer: parsedAnswer })
  } catch (error) {
    console.error('[AI API] Error:', error)
    const message = error instanceof Error ? error.message : 'AI 调用失败'
    res.status(500).json({ message })
  }
})

/**
 * POST /api/ai/judge
 * 判定最终猜测是否正确
 */
router.post('/judge', async (req, res) => {
  try {
    const { guess, truth } = req.body

    if (!guess || !truth) {
      return res.status(400).json({ message: '缺少必要参数' })
    }

    const userPrompt = `你是海龟汤游戏的裁判。请判断玩家的"最终猜测"是否与"故事真相"在核心事实上一致。

【故事真相】
${truth}

【玩家猜测】
${guess}

判定规则：
1. 只要玩家猜出了核心事实（关键人物、关键事件、死因/结果），即使细节有偏差也算正确
2. 允许表述不同，允许玩家用自己的话复述
3. 只有当核心事实完全错误或偏离主题时才判 false

如果玩家猜测的核心事实与真相一致，返回 true
如果不一致或完全错误，返回 false

严格只输出：true 或 false`

    const answer = await callQwenAPI([
      { role: 'system', content: '你是海龟汤游戏裁判，判断猜测是否正确，只输出 true 或 false。' },
      { role: 'user', content: userPrompt },
    ])

    const correct = answer === 'true'
    res.json({ correct })
  } catch (error) {
    console.error('[AI API] Error:', error)
    const message = error instanceof Error ? error.message : '判定失败'
    res.status(500).json({ message })
  }
})

export default router
