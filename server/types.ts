export type YesNoIrrelevant = '是' | '否' | '无关'

export type SessionStage = 'questioning' | 'revealed'

export type ConversationItem = {
  question: string
  answer: YesNoIrrelevant
  createdAt: number
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

