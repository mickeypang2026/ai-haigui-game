import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listStories } from '../lib/api'
import type { Story } from '../lib/types'

function Home() {
  const navigate = useNavigate()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const data = await listStories()
        if (!cancelled) setStories(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  /**
   * 点击故事卡片：直接跳转到游戏页面（由 Game 页面创建会话）
   */
  function handleStartGame(storyId: string) {
    navigate(`/game/${storyId}`)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <section className="w-full rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-lg sm:p-10">
        <h1 className="text-3xl font-bold text-amber-400 sm:text-4xl">AI 海龟汤</h1>
        <p className="mt-4 text-slate-300">阅读汤面后提问推理，主持人只会回答：是 / 否 / 无关。</p>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-900/60 bg-rose-950/40 p-3 text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="text-sm text-slate-400">
            📖 选择一个故事开始游戏，无限次提问直到揭晓真相
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-200">题目列表</h2>
          {loading ? (
            <p className="mt-3 text-slate-400">加载中…</p>
          ) : null}
          {!loading && stories.length === 0 ? (
            <p className="mt-3 text-slate-400">暂无题目</p>
          ) : null}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stories.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => void handleStartGame(s.id)}
                className="group flex flex-col items-start rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-left shadow-lg transition-all hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-xl"
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-100 group-hover:text-amber-400">
                    {s.title}
                  </h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      s.difficulty === 'easy'
                        ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                        : s.difficulty === 'medium'
                          ? 'border-amber-500/30 bg-amber-500/20 text-amber-400'
                          : 'border-rose-500/30 bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {s.difficulty === 'easy' ? '简单' : s.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
                  {s.surface}
                </p>
                <div className="mt-3 text-xs text-amber-400 opacity-0 transition-opacity group-hover:opacity-100">
                  点击开始 →
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
