import { useEffect, useRef, useState } from 'react'
import Message from './Message'

type YesNoIrrelevant = '是' | '否' | '无关'

interface ConversationItem {
  question: string
  answer: YesNoIrrelevant
  createdAt: number
}

export interface ChatBoxProps {
  /** 对话历史 */
  conversation: ConversationItem[]
  /** 是否正在加载 */
  loading?: boolean
  /** 是否已解锁（禁用输入） */
  disabled?: boolean
  /** 发送问题回调 */
  onSend: (question: string) => void
}

/**
 * 聊天对话框组件
 * 包含消息列表和输入区域
 */
export function ChatBox({
  conversation,
  loading = false,
  disabled = false,
  onSend,
}: ChatBoxProps) {
  const [question, setQuestion] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // 新消息到达时自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [conversation.length])

  /**
   * 发送消息
   */
  function handleSend() {
    const q = question.trim()
    if (!q || loading || disabled) return
    onSend(q)
    setQuestion('')
  }

  /**
   * 处理键盘事件
   */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = !loading && !disabled && question.trim()

  return (
    <div className="flex flex-col h-full bg-slate-950/30 rounded-lg border border-slate-800 shadow-lg">
      {/* 头部 - 提问环节 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-sm font-medium text-slate-300">提问环节</span>
      </div>

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[40vh] max-h-[50vh]">
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <svg
              className="w-16 h-16 mb-4 opacity-50"
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
            <p className="text-sm">还没有提问，试着问一个"是/否"问题吧</p>
          </div>
        ) : (
          <>
            {conversation.map((item, index) => (
              <Message
                key={`${item.createdAt}-${index}`}
                role="user"
                question={item.question}
                timestamp={item.createdAt}
              />
            ))}
            {conversation.map((item, index) => (
              <Message
                key={`${item.createdAt}-${index}-answer`}
                role="assistant"
                question={item.question}
                answer={item.answer}
                timestamp={item.createdAt}
              />
            ))}
          </>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              />
              <span
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
            <span>主持人思考中...</span>
          </div>
        )}

        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-slate-800 px-4 py-3">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              disabled
                ? '游戏已结束，无法继续提问'
                : '输入你的问题（主持人只回答 是/否/无关）'
            }
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900 font-medium text-sm transition-all hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-amber-500 disabled:hover:to-amber-600 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            发送
          </button>
        </div>

        {/* 提示信息 */}
        <p className="mt-2 text-xs text-slate-500 text-center">
          按 Enter 发送问题 | 主持人只会回答「是」「否」或「无关」
        </p>
      </div>
    </div>
  )
}

export default ChatBox
