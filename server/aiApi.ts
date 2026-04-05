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

    const userPrompt = `你是一个海龟汤（情境推理游戏）的主持人。你的任务是根据"故事真相"判断玩家问题的答案。

## 输入信息
- 【故事真相】：游戏的完整真相
- 【玩家问题】：玩家提出的是非疑问句

## 输出规则
你必须且只能从以下三个答案中选择一个：
- "是"：问题描述的情况与真相一致，或可以从真相中逻辑推导为真
- "否"：问题描述的情况与真相矛盾，或可以从真相中逻辑推导为假
- "无关"：问题无法从真相中推断，或问题包含多个子问题难以判断

## 判断逻辑
1. 首先检查问题是否可以直接从真相中找到答案
2. 如果可以，判断是"是"还是"否"
3. 如果真相中没有足够信息判断，返回"无关"

## 示例

**示例 1**
真相：小明是个盲人，他养的导盲犬是他唯一的伙伴。
问题：小明看不见吗？
答案：是

**示例 2**
真相：小明是个盲人，他养的导盲犬是他唯一的伙伴。
问题：小明能看见东西吗？
答案：否

**示例 3**
真相：小明是个盲人，他养的导盲犬是他唯一的伙伴。
问题：小明喜欢吃什么？
答案：无关

**示例 4**
真相：妹妹在暴雨夜被车撞死了。
问题：死者是男性吗？
答案：否

**示例 5**
真相：他发现自己按错了电梯楼层。
问题：他身高有缺陷吗？
答案：无关

## 约束
- 严格只输出一个字："是"、"否"或"无关"
- 不要输出任何解释、标点符号或其他内容
- 不要输出"答案：是"这样的格式，只输出"是"

## 任务
【故事真相】
${truth}

【玩家问题】
${question}

请判断问题的答案：`

    const answer = await callQwenAPI([
      { role: 'system', content: '你是海龟汤游戏主持人。根据真相判断问题，严格只输出"是"、"否"或"无关"，不要任何解释。' },
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

    const userPrompt = `你是一个海龟汤游戏的裁判。请判断玩家的"最终猜测"是否与"故事真相"在核心事实上一致。

## 输入信息
- 【故事真相】：游戏的完整真相
- 【玩家猜测】：玩家对真相的推测

## 输出规则
- 如果玩家猜出了核心事实，输出：true
- 如果玩家没有猜出核心事实，输出：false

## 判定规则
### 判为 true 的情况（猜对了）
1. 玩家猜出了关键人物/主体
2. 玩家猜出了关键事件/行为
3. 玩家猜出了核心结果（如死因、结局等）
4. 即使细节有偏差，但核心事实正确

### 判为 false 的情况（猜错了）
1. 关键人物/主体错误
2. 关键事件/行为错误
3. 核心结果错误
4. 完全偏离主题的猜测

### 重要原则
- 允许表述不同：玩家可以用自己的话复述
- 允许细节偏差：只要核心事实正确即可
- 关注"什么发生了"而不是"怎么描述"

## 示例

**示例 1**
真相：盲人吃了海龟肉后自杀了，因为他意识到之前吃的不是海龟肉而是他宠物的肉。
猜测：盲人发现他之前吃的东西有问题，所以自杀了。
判定：true
说明：猜出了核心事实（吃了不该吃的东西后自杀），细节偏差不影响

**示例 2**
真相：妹妹在暴雨夜被车撞死了，哥哥因为内疚自杀了。
猜测：妹妹是被谋杀的，哥哥发现了凶手。
判定：false
说明：核心事实错误（车祸 vs 谋杀，自杀 vs 发现凶手）

**示例 3**
真相：侏儒因为其他演员嘲笑他的身高而自杀了。
猜测：侏儒因为工作压力太大了。
判定：false
说明：完全偏离主题，没有猜出核心事实（被嘲笑导致自杀）

**示例 4**
真相：他按了电梯按钮后发现不对劲，因为他以为自己会飞。
猜测：他发现自己其实不会飞，从高楼跳下去了。
判定：true
说明：猜出了核心事实（以为自己会飞是错的）

## 约束
- 严格只输出：true 或 false
- 不要输出任何解释、标点或其他内容

## 任务
【故事真相】
${truth}

【玩家猜测】
${guess}

请判断猜测是否正确（输出 true 或 false）：`

    const answer = await callQwenAPI([
      { role: 'system', content: '你是海龟汤游戏裁判。判断猜测是否猜出核心事实，严格只输出 true 或 false，不要任何解释。' },
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
