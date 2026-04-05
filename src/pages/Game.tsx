import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ChatBox from '../../components/ChatBox'
import { createSession, endSession, getSession, askQuestion } from '../lib/api'

/**
 * 游戏状态
 */
type GameStatus = 'playing' | 'ended' | 'revealed'

/**
 * 游戏页面 - 海龟汤核心玩法界面
 */
export function Game() {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()

  // 会话状态
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [storyTitle, setStoryTitle] = useState('')
  const [surface, setSurface] = useState('')
  const [conversation, setConversation] = useState<Array<{ question: string; answer: '是' | '否' | '无关'; createdAt: number }>>([])
  const [truthUnlocked, setTruthUnlocked] = useState(false)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')

  // UI 状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  // 初始化会话
  useEffect(() => {
    if (!storyId) {
      setError('缺少故事 ID')
      setInitializing(false)
      return
    }

    let cancelled = false

    async function initSession() {
      try {
        setError(null)
        const { id } = await createSession({ storyId })
        if (!cancelled) {
          setSessionId(id)
          await loadSession(id)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '创建会话失败')
        }
      } finally {
        if (!cancelled) {
          setInitializing(false)
        }
      }
    }

    void initSession()
    return () => {
      cancelled = true
    }
  }, [storyId])

  // 加载会话详情
  async function loadSession(id: string) {
    try {
      const data = await getSession(id)
      setStoryTitle(data.storyTitle || '')
      setSurface(data.story)
      setConversation(data.conversation as Array<{ question: string; answer: '是' | '否' | '无关'; createdAt: number }>)
      setTruthUnlocked(data.truthUnlocked)
      if (data.truthUnlocked) {
        setGameStatus('revealed')
      }
    } catch (e) {
      console.error('Failed to load session:', e)
    }
  }

  // 游戏是否已结束
  const isGameEnded = gameStatus === 'ended' || gameStatus === 'revealed' || truthUnlocked

  // 发送问题
  async function handleSendQuestion(question: string) {
    if (!sessionId || isGameEnded) return

    setLoading(true)
    setError(null)

    try {
      const data = await askQuestion(sessionId, question)
      setConversation(data.conversation)
      setTruthUnlocked(data.truthUnlocked)

      if (data.truthUnlocked) {
        setGameStatus('revealed')
        // 自动跳转到 Result 页面
        setTimeout(() => {
          navigate(`/result/${sessionId}`)
        }, 800)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败')
    } finally {
      setLoading(false)
    }
  }

  // 结束游戏 - 揭晓汤底（FR-05）
  async function handleEndGame() {
    if (!sessionId) return

    if (!window.confirm('确定要结束游戏吗？将揭晓汤底。')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await endSession(sessionId)
      setGameStatus('ended')
      setTruthUnlocked(true)
      // 揭晓汤底，跳转到 Result 页面
      setTimeout(() => {
        navigate(`/result/${sessionId}`)
      }, 500)
    } catch (e) {
      setError(e instanceof Error ? e.message : '结束失败')
    } finally {
      setLoading(false)
    }
  }

  // 查看汤底 - 跳转到 Result 页面
  function handleRevealTruth() {
    if (!sessionId) return
    navigate(`/result/${sessionId}`)
  }

  // 放弃游戏 - 直接返回大厅
  function handleGiveUp() {
    if (!window.confirm('确定要放弃这次游戏吗？你将失去当前的推理进度。')) {
      return
    }
    navigate('/')
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="relative mx-auto mb-6 h-24 w-24">
            <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20"></div>
            <div className="absolute inset-4 animate-pulse rounded-full bg-amber-400/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🎲</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-amber-300 animate-pulse">游戏加载中</h2>
          <p className="mt-2 text-slate-400">正在准备游戏会话，请稍候...</p>
          <div className="mt-6 flex justify-center gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-amber-500"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
            >
              ← 大厅
            </Link>
            <span className={`text-xs px-2 py-1 rounded-full ${
              gameStatus === 'playing' ? 'bg-emerald-900/50 text-emerald-300' :
              gameStatus === 'ended' ? 'bg-rose-900/50 text-rose-300' :
              'bg-amber-900/50 text-amber-300'
            }`}>
              {gameStatus === 'playing' ? '进行中' : gameStatus === 'ended' ? '已结束' : '已揭晓'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGiveUp}
              disabled={loading || isGameEnded}
              className="text-sm font-medium text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              放弃
            </button>
            <button
              type="button"
              onClick={handleRevealTruth}
              disabled={loading || isGameEnded}
              className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              查看汤底
            </button>
            <button
              type="button"
              onClick={handleEndGame}
              disabled={loading || isGameEnded}
              className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              结束游戏
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        {/* 错误提示 */}
        {error && (
          <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3 text-rose-200 text-sm flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-rose-300 hover:text-rose-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 汤面卡片 */}
        <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 className="text-lg font-semibold text-slate-200">{storyTitle || '题目'}</h2>
          </div>
          <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">{surface || '加载中...'}</p>
        </section>

        {/* 聊天对话框 */}
        <section className="h-[60vh]">
          <ChatBox
            conversation={conversation}
            loading={loading}
            disabled={isGameEnded}
            onSend={handleSendQuestion}
          />
        </section>
      </main>
    </div>
  )
}

export default Game
