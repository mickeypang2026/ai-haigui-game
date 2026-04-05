export type YesNoIrrelevant = '是' | '否' | '无关'

export type SessionStage = 'questioning' | 'revealed'

export type ConversationItem = {
  question: string
  answer: YesNoIrrelevant
  createdAt: number
  isDefaultAnswer?: boolean // 标记是否为默认回答（AI 回答不规范时使用）
}

export type FinalGuess = {
  guess: string
  correct: boolean
  createdAt: number
}

export type Session = {
  id: string
  storyId: string
  story: string
  truth: string
  stage: SessionStage
  conversation: ConversationItem[]
  finalGuess?: FinalGuess
}

