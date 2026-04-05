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

