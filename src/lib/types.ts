export type Difficulty = 'easy' | 'medium' | 'hard'

export type Story = {
  id: string
  title: string
  difficulty: Difficulty
  surface: string
  bottom: string
}

export type YesNoIrrelevant = '是' | '否' | '无关'

export type ConversationItem = {
  question: string
  answer: YesNoIrrelevant
  createdAt: number
  isDefaultAnswer?: boolean // 标记是否为默认回答（AI 回答不规范时使用）
}

export type SessionPublic = {
  id: string
  storyTitle?: string
  story: string
  conversation: ConversationItem[]
  truthUnlocked: boolean
  truth?: string
  finalGuess?: { guess: string; correct: boolean; createdAt: number } | null
}

