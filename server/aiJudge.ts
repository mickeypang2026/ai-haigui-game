import type { YesNoIrrelevant } from './types'

const LABELS: readonly YesNoIrrelevant[] = ['是', '否', '无关']

export function isYesNoIrrelevant(value: unknown): value is YesNoIrrelevant {
  return typeof value === 'string' && (LABELS as readonly string[]).includes(value)
}

/**
 * 本地语义判断（降级方案）
 * 当 API 不可用时使用
 */
function judgeQuestionLocal(truth: string, question: string): YesNoIrrelevant {
  const q = question.toLowerCase()
  const t = truth.toLowerCase()

  // 提取汤底中的关键事实
  const truthFacts: Array<{ keywords: string[]; isTrue: boolean }> = [
    // 从汤底提取实体和属性
    { keywords: ['盲人', '瞎', '看不见'], isTrue: t.includes('盲人') || t.includes('瞎') },
    { keywords: ['生病', '疾病', '病', '死'], isTrue: t.includes('病') || t.includes('死') },
    { keywords: ['狗', '导盲犬', '犬'], isTrue: t.includes('狗') || t.includes('犬') },
    { keywords: ['宠物', '动物'], isTrue: t.includes('动物') || t.includes('宠物') },
    { keywords: ['药', '药物', '救命'], isTrue: t.includes('药') },
    { keywords: ['血', '血液', '红色'], isTrue: t.includes('血') },
    { keywords: ['自杀', '自己杀'], isTrue: t.includes('自杀') },
    { keywords: ['他杀', '被杀', '谋杀'], isTrue: t.includes('他杀') || t.includes('被杀') },
    { keywords: ['孕妇', '怀孕', '胎儿', '肚子'], isTrue: t.includes('孕妇') || t.includes('怀孕') || t.includes('胎儿') },
    { keywords: ['侏儒', '矮小', '身高'], isTrue: t.includes('侏儒') || t.includes('矮') },
    { keywords: ['伞', '雨伞'], isTrue: t.includes('伞') },
    { keywords: ['电梯', '按钮'], isTrue: t.includes('电梯') },
    { keywords: ['马戏团', '演员', '表演'], isTrue: t.includes('马戏团') || t.includes('演员') },
    { keywords: ['子弹', '枪', '开枪'], isTrue: t.includes('子弹') || t.includes('枪') },
    { keywords: ['吞', '吃', '咽'], isTrue: t.includes('吞') || t.includes('吃') || t.includes('咽') },
    { keywords: ['敲门', '敲门声'], isTrue: t.includes('敲门') },
  ]

  // 检查问题是否匹配某个事实
  for (const fact of truthFacts) {
    if (fact.keywords.some(k => q.includes(k))) {
      // 检查是否有否定词
      const hasNegation = q.includes('不是') || q.includes('没有') || q.includes('没') || q.includes('非')
      return hasNegation ? (fact.isTrue ? '否' : '是') : (fact.isTrue ? '是' : '否')
    }
  }

  // 如果问题中的关键词在汤底中出现，可能是相关的
  const qWords = q.split(/[\s，。,.!?！？；;:：？?]+/).filter(w => w.length >= 2)
  const relevantWords = qWords.filter(w => t.includes(w))

  if (relevantWords.length > 0) {
    // 有相关词但无法确定真假，返回"无关"让玩家继续推理
    return '无关'
  }

  return '无关'
}

/**
 * 使用 AI 模型判断问题的答案
 * 调用 Claude API 进行语义理解
 */
export async function judgeQuestion(params: { truth: string; question: string }): Promise<YesNoIrrelevant> {
  const { truth, question } = params

  // 优先使用通义千问 API
  const apiKey = process.env.QWEN_API_KEY || process.env.ANTHROPIC_API_KEY
  const baseUrl = process.env.QWEN_BASE_URL || process.env.ANTHROPIC_BASE_URL
  const model = process.env.QWEN_MODEL || process.env.ANTHROPIC_MODEL || 'qwen-plus'

  if (!apiKey) {
    console.warn('[AI Judge] API key not set, using local judge')
    return judgeQuestionLocal(truth, question)
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

  // 通义千问 API 格式
  const apiUrl = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`

  console.log('[AI Judge] Using Qwen API:', apiUrl, 'Model:', model)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: '你是海龟汤游戏主持人。根据真相判断问题，严格只输出"是"、"否"或"无关"，不要任何解释。' },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AI Judge] Qwen API error:', response.status, errorText)
      console.warn('[AI Judge] Falling back to local judge')
      return judgeQuestionLocal(truth, question)
    }

    const data = await response.json()
    console.log('[AI Judge] Response:', JSON.stringify(data).slice(0, 200))
    const answer = data.choices?.[0]?.message?.content?.trim() || ''

    // 验证输出格式
    if (answer === '是' || answer === '否' || answer === '无关') {
      return answer
    }

    // 尝试从回答中提取
    if (answer.includes('是')) return '是'
    if (answer.includes('否')) return '否'
    if (answer.includes('无关')) return '无关'

    console.warn('[AI Judge] Invalid answer format:', answer)
    return '无关'
  } catch (error) {
    console.error('[AI Judge] Fetch error:', error)
    return '无关'
  }
}

/**
 * 判断最终猜测是否正确
 * 使用 AI 进行语义相似度判断
 */
export async function judgeFinalGuess(params: { truth: string; guess: string }): Promise<boolean> {
  const { truth, guess } = params

  // 优先使用通义千问 API
  const apiKey = process.env.QWEN_API_KEY || process.env.ANTHROPIC_API_KEY
  const baseUrl = process.env.QWEN_BASE_URL || process.env.ANTHROPIC_BASE_URL
  const model = process.env.QWEN_MODEL || process.env.ANTHROPIC_MODEL || 'qwen-plus'

  if (!apiKey) {
    console.warn('[AI Judge] API key not set, using local judge')
    return judgeFinalGuessLocal(truth, guess)
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

  // 通义千问 API 格式
  const apiUrl = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`

  console.log('[AI Judge] Using Qwen API:', apiUrl, 'Model:', model)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: '你是海龟汤游戏裁判。判断猜测是否猜出核心事实，严格只输出 true 或 false，不要任何解释。' },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      console.error('[AI Judge] Qwen API error:', await response.text())
      console.warn('[AI Judge] Falling back to local judge')
      return judgeFinalGuessLocal(truth, guess)
    }

    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content?.trim() || ''
    console.log('[AI Judge] FinalGuess response:', answer)

    return answer === 'true'
  } catch (error) {
    console.error('[AI Judge] Fetch error:', error)
    return false
  }
}

/**
 * 本地最终猜测判断（降级方案）
 * 动态从汤底提取核心事实进行比对
 */
function judgeFinalGuessLocal(truth: string, guess: string): boolean {
  const t = truth.toLowerCase()
  const g = guess.toLowerCase()

  // 从汤底提取关键名词（核心实体）
  const entityPatterns = [
    /盲人 | 瞎子 | 看不见/g,
    /狗 | 导盲犬 | 犬/g,
    /药 | 药物 | 药品/g,
    /血 | 血液/g,
    /自杀 | 自尽/g,
    /哥哥 | 妹妹 | 弟弟 | 姐姐/g,
    /侏儒 | 矮小 | 身高/g,
    /电梯 | 按钮/g,
    /伞 | 雨伞/g,
    /马戏团 | 演员 | 表演/g,
    /子弹 | 枪/g,
    /孕妇 | 怀孕 | 胎儿/g,
    /敲门 | 敲门声/g,
  ]

  // 统计汤底中的实体数量
  let entityCount = 0
  let matchCount = 0

  for (const pattern of entityPatterns) {
    const matches = t.match(pattern)
    if (matches && matches.length > 0) {
      entityCount++
      // 检查猜测中是否也有相同实体
      if (pattern.test(g)) {
        matchCount++
      }
    }
  }

  // 提取汤底中的关键动词/状态
  const actionKeywords = ['死', '病', '意识', '知道', '发现', '打开', '吃', '喝', '吞']
  let actionMatch = 0
  let actionTotal = 0

  for (const keyword of actionKeywords) {
    if (t.includes(keyword)) {
      actionTotal++
      if (g.includes(keyword)) {
        actionMatch++
      }
    }
  }

  // 综合判断：实体匹配 + 动作匹配
  const entityScore = entityCount > 0 ? matchCount / entityCount : 0
  const actionScore = actionTotal > 0 ? actionMatch / actionTotal : 0
  const totalScore = (entityScore * 0.7 + actionScore * 0.3) // 实体权重 70%，动作 30%

  const result = totalScore >= 0.5 // 50% 相似度即认为猜对

  console.log(`[AI Judge] Local final guess: entities=${matchCount}/${entityCount}, actions=${actionMatch}/${actionTotal}, score=${totalScore.toFixed(2)}, result=${result}`)
  return result
}

