import { useEffect, useRef, useState } from 'react'
import { Message } from './Message'

export interface ChatBoxProps {
  conversation: Array<{ question: string; answer: string; createdAt: number }>
  loading: boolean
  disabled: boolean
  onSend: (question: string) => Promise<void>
}

export function ChatBox({ conversation, loading, disabled, onSend }: ChatBoxProps) {
  const [input, setInput] = useState('')
  const [prevLength, setPrevLength] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 新消息到达时自动滚动到底部
  useEffect(() => {
    if (conversation.length > prevLength) {
      setPrevLength(conversation.length)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
    }
  }, [conversation.length, prevLength])

  // 初始加载时也滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading || disabled) return

    await onSend(trimmed)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/50 shadow-lg">
      {/* 消息列表 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-3 sm:p-4">
        {conversation.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <div className="text-center px-4">
              <div className="relative mx-auto mb-4 h-20 w-20">
                <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20"></div>
                <div className="absolute inset-2 animate-pulse rounded-full bg-amber-400/30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-300">开始你的推理之旅</h3>
              <p className="max-w-xs text-sm leading-relaxed text-slate-400">
                向主持人提问吧，只会回答「<span className="text-emerald-400 font-medium">是</span>」、
                「<span className="text-rose-400 font-medium">否</span>」或
                「<span className="text-slate-300 font-medium">无关</span>」
              </p>
              <div className="mt-6 rounded-lg bg-slate-800/50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  💡 提示：从故事的基本要素开始提问，逐步缩小范围
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.map((item, index) => (
              <Message
                key={index}
                question={item.question}
                answer={item.answer}
                timestamp={item.createdAt}
                index={index}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Loading 状态 */}
        {loading && (
          <div className="mt-4 flex justify-start">
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/80 px-4 py-3 shadow-lg">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-400"></span>
                <span
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-400"
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-400"
                  style={{ animationDelay: '0.3s' }}
                ></span>
              </div>
              <span className="text-sm text-slate-400">主持人正在思考...</span>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-slate-800 bg-slate-900/30 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || loading}
              placeholder={disabled ? '游戏已结束' : '按 Enter 发送问题...'}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || loading || !input.trim()}
            className="flex-shrink-0 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-slate-900 transition-all hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
          >
            <span className="hidden sm:inline">发送</span>
            <svg className="h-5 w-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {disabled && (
          <p className="mt-2 text-center text-xs text-slate-500">
            游戏已结束，查看结果或再来一局吧
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatBox
