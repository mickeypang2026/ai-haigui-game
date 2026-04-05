import dotenv from 'dotenv';
import path from 'node:path';
// 从项目根目录加载 .env 文件（因为 tsx 可能在子目录运行）
dotenv.config({ path: path.join(process.cwd(), '.env') });
import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { judgeFinalGuess, judgeQuestion } from './aiJudge'
import { getSession, saveSession } from './gameStore'
import { STORIES } from './stories'
import type { Session, YesNoIrrelevant } from './types'
import aiApiRouter from './aiApi'

const app = express()

// 配置 CORS - 允许前端访问
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // 允许的前端地址
  credentials: true, // 允许携带 Cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的方法
  allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
}))

// 解析 JSON 请求体
app.use(express.json({ limit: '64kb' }))

// 注册 AI API 路由
app.use('/api/ai', aiApiRouter)

// ==================== 测试接口 ====================
app.get('/api/test', (_req, res) => {
  res.json({
    ok: true,
    message: '后端服务器运行正常！',
    timestamp: new Date().toISOString(),
  })
})

function publicSession(session: Session, storyTitle?: string): Record<string, unknown> {
  const truthUnlocked = session.stage === 'revealed'
  return {
    id: session.id,
    storyTitle: storyTitle || '',
    story: session.story,
    conversation: session.conversation,
    truthUnlocked,
    ...(truthUnlocked
      ? {
          truth: session.truth,
          finalGuess: session.finalGuess ?? null,
        }
      : {}),
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/stories', (_req, res) => {
  res.json(
    STORIES.map((s) => ({
      id: s.id,
      title: s.title,
      difficulty: s.difficulty,
      surface: s.surface,
    })),
  )
})

app.post('/api/session', (req, res) => {
  const storyId = typeof req.body?.storyId === 'string' ? req.body.storyId : null

  // 根据 storyId 选择故事，如果未指定或找不到则随机选择
  let story = storyId ? STORIES.find(s => s.id === storyId) : null
  if (!story) {
    story = STORIES[Math.floor(Math.random() * STORIES.length)]
  }
  if (!story) return res.status(500).json({ message: 'No stories available.' })

  const id = randomUUID()
  const session: Session = {
    id,
    storyId: story.id,
    story: story.surface,
    truth: story.bottom,
    stage: 'questioning',
    conversation: [],
  }

  saveSession(session)
  res.json({ id })
})

app.get('/api/session/:id', (req, res) => {
  const id = req.params.id
  const session = getSession(id)
  if (!session) return res.status(404).json({ message: 'Session not found.' })
  const story = STORIES.find(s => s.id === session.storyId)
  res.json(publicSession(session, story?.title))
})

app.post('/api/session/:id/question', async (req, res) => {
  const id = req.params.id
  const session = getSession(id)
  if (!session) return res.status(404).json({ message: 'Session not found.' })
  if (session.stage === 'revealed') {
    return res.status(400).json({ message: 'Session already revealed.' })
  }

  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : ''
  if (!question) return res.status(400).json({ message: 'Question is required.' })

  const answer: YesNoIrrelevant = await judgeQuestion({ truth: session.truth, question })
  session.conversation.push({ question, answer, createdAt: Date.now() })

  saveSession(session)
  const story = STORIES.find(s => s.id === session.storyId)
  res.json(publicSession(session, story?.title))
})

app.post('/api/session/:id/final', async (req, res) => {
  const id = req.params.id
  const session = getSession(id)
  if (!session) return res.status(404).json({ message: 'Session not found.' })

  const guess = typeof req.body?.guess === 'string' ? req.body.guess.trim() : ''
  if (!guess) return res.status(400).json({ message: 'Guess is required.' })
  if (session.finalGuess) return res.status(400).json({ message: 'Final guess already submitted.' })

  const correct = await judgeFinalGuess({ truth: session.truth, guess })
  session.finalGuess = { guess, correct, createdAt: Date.now() }
  session.stage = 'revealed'
  saveSession(session)

  res.json({ truth: session.truth, finalGuess: session.finalGuess })
})

app.post('/api/session/:id/end', (req, res) => {
  const id = req.params.id
  const session = getSession(id)
  if (!session) return res.status(404).json({ message: 'Session not found.' })
  session.stage = 'revealed'
  saveSession(session)
  const story = STORIES.find(s => s.id === session.storyId)
  res.json(publicSession(session, story?.title))
})

const port = process.env.PORT ? Number(process.env.PORT) : 8787
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${port}`)
})

