import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getSession, submitFinalGuess } from '../lib/api'
import type { SessionPublic } from '../lib/types'

function Result() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionPublic | null>(null)
  const [guess, setGuess] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTruth, setShowTruth] = useState(false)
  const [revealing, setRevealing] = useState(false)

  const canReveal = session?.truthUnlocked ?? false
  const hasFinalGuess = Boolean(session?.finalGuess && session.finalGuess !== null)
  const correctText = useMemo(() => {
    const fg = session?.finalGuess
    if (!fg || fg === null) return null
    return fg.correct ? '正确' : '错误'
  }, [session?.finalGuess])

  // 自动开始揭晓动画
  useEffect(() => {
    if (canReveal && !showTruth) {
      setRevealing(true)
      const timer = setTimeout(() => {
        setRevealing(false)
        setShowTruth(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [canReveal, showTruth])

  useEffect(() => {
    const id = sessionId
    if (!id) return
    let cancelled = false
    async function run(sessionIdValue: string) {
      try {
        setError(null)
        const data = await getSession(sessionIdValue)
        if (!cancelled) setSession(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
      }
    }
    void run(id)
    return () => {
      cancelled = true
    }
  }, [sessionId])

  // 加载中状态
  if (!session && !error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="relative mx-auto mb-6 h-24 w-24">
            <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20"></div>
            <div className="absolute inset-4 animate-pulse rounded-full bg-amber-400/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🔮</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-amber-300 animate-pulse">正在揭晓真相</h2>
          <p className="mt-2 text-slate-400">即将揭晓最终答案...</p>
        </div>
      </div>
    )
  }

  async function handleSubmitFinal() {
    if (!sessionId) return
    const g = guess.trim()
    if (!g) return
    try {
      setBusy(true)
      setError(null)
      const data = await submitFinalGuess(sessionId, g)
      setSession((prev) => ({
        ...(prev ?? {
          id: sessionId,
          story: '',
          conversation: [],
          truthUnlocked: true,
        }),
        truthUnlocked: true,
        truth: data.truth,
        finalGuess: data.finalGuess,
      }))
      setGuess('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10">
      {/* 揭晓动画 */}
      {revealing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90">
          <div className="text-center">
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/30"></div>
              <div className="absolute inset-2 animate-pulse rounded-full bg-amber-400/50"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-amber-300">🔮</span>
              </div>
            </div>
            <p className="mt-8 animate-pulse text-2xl font-semibold text-amber-300">
              揭晓真相...
            </p>
          </div>
        </div>
      )}

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-amber-400">🎯 游戏结果</h2>
          <Link
            to="/"
            className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-amber-300"
          >
            🔄 再来一局
          </Link>
        </div>

        {/* 故事标题 */}
        {session?.storyTitle && (
          <div className="mb-6 rounded-lg border border-amber-900/50 bg-amber-950/30 p-4">
            <h3 className="text-lg font-medium text-amber-200">📖 {session.storyTitle}</h3>
          </div>
        )}

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-900/60 bg-rose-950/40 p-4 text-rose-200 animate-fade-in-up">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">加载失败</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 w-full rounded-lg bg-rose-800/50 px-4 py-2 text-sm font-medium transition hover:bg-rose-700/50"
            >
              返回大厅
            </button>
          </div>
        ) : null}

        {!canReveal ? (
          <div className="mt-6 space-y-6">
            {/* 最终猜测输入框 - 未解锁时也可以提交 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-200">
                <span>🎲</span>提交最终猜测
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={busy}
                  placeholder="我认为真相是……"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSubmitFinal()
                  }}
                />
                <button
                  type="button"
                  disabled={busy || !guess.trim()}
                  onClick={() => void handleSubmitFinal()}
                  className="rounded-lg bg-amber-400 px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  提交
                </button>
              </div>
            </div>

            {/* 汤底尚未解锁提示 */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-slate-200">汤底尚未解锁</h3>
                  <p className="text-sm text-slate-400">提交最终猜测或返回继续提问</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/game/${sessionId ?? ''}`)}
                  className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/50 hover:border-amber-400/50"
                >
                  返回继续提问
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/50"
                >
                  返回大厅
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {canReveal ? (
          <div className="mt-6 space-y-6">
            {/* 汤底 - 突出显示 */}
            <div className={`relative overflow-hidden rounded-xl border-2 border-amber-700/50 bg-gradient-to-br from-amber-950/60 to-slate-900 p-6 shadow-2xl transition-all duration-700 ${showTruth ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">🍲</span>
                <h3 className="text-lg font-bold uppercase tracking-widest text-amber-400">汤底</h3>
              </div>
              <p className="whitespace-pre-wrap text-lg leading-8 text-amber-100 shadow-black drop-shadow">
                {session?.truth ?? '—'}
              </p>
            </div>

            {/* 最终猜测 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-200">
                <span>🎲</span>最终猜测
              </h3>
              {hasFinalGuess ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${correctText === '正确' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-rose-900/50 text-rose-300'}`}>
                      {correctText === '正确' ? '✓ 正确' : '✗ 错误'}
                    </span>
                  </div>
                  <div className="text-slate-300">你的猜测：{session?.finalGuess?.guess}</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    disabled={busy}
                    placeholder="我认为真相是……"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSubmitFinal()
                    }}
                  />
                  <button
                    type="button"
                    disabled={busy || !guess.trim()}
                    onClick={() => void handleSubmitFinal()}
                    className="rounded-lg bg-amber-400 px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    提交
                  </button>
                </div>
              )}
            </div>

            {/* 对话历史 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-200">
                <span>💬</span>推理过程回放
              </h3>
              <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                {session?.conversation.length ? (
                  session.conversation.map((m, idx) => (
                    <div key={`${m.createdAt}-${idx}`} className="group rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition hover:border-slate-600">
                      <div className="mb-1 text-sm font-medium text-slate-300">
                        <span className="mr-2 text-amber-400">❓</span>你：{m.question}
                      </div>
                      <div className="text-sm">
                        <span className="mr-2 text-slate-400">🎙️</span>主持人：
                        <span className={`rounded px-2 py-0.5 text-sm font-medium ${
                          m.answer === '是' ? 'bg-emerald-900/40 text-emerald-300' :
                          m.answer === '否' ? 'bg-rose-900/40 text-rose-300' :
                          'bg-slate-700/40 text-slate-300'
                        }`}>
                          {m.answer}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">暂无对话记录</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default Result
