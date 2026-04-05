type YesNoIrrelevant = '是' | '否' | '无关'

export interface MessageProps {
  role: 'user' | 'assistant'
  question?: string
  answer?: YesNoIrrelevant
  timestamp?: number
  isDefaultAnswer?: boolean // 标记是否为默认回答
}

/**
 * 聊天消息组件 - 显示单条对话消息
 * - 用户消息：右侧，蓝色系
 * - AI 主持人消息：左侧，金色/紫色系
 */
export function Message({ role, question, answer, timestamp, isDefaultAnswer }: MessageProps) {
  const isUser = role === 'user'
  const timeLabel = timestamp ? formatTime(timestamp) : ''

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 头像 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
            : 'bg-gradient-to-br from-amber-500 to-purple-600'
        }`}
      >
        {isUser ? (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* 角色标签 */}
        <span className="text-xs text-slate-500 mb-1 px-1">
          {isUser ? '你' : '主持人'}
        </span>

        {/* 问题气泡 */}
        {question && (
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-md ${
              isUser
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                : 'bg-slate-800 text-slate-200 rounded-bl-md'
            }`}
          >
            <p className="text-sm leading-relaxed">{question}</p>
          </div>
        )}

        {/* 答案气泡（仅 AI） */}
        {answer && (
          <div className="mt-2">
            <AnswerBadge answer={answer} isDefaultAnswer={isDefaultAnswer} />
            {isDefaultAnswer && answer === '无关' && (
              <p className="text-xs text-amber-500/80 mt-1.5 px-1">
                主持人没有理解你的问题，请尝试重新表述或提出更具体的"是/否"问题
              </p>
            )}
          </div>
        )}

        {/* 时间戳 */}
        {timeLabel && (
          <span className="text-xs text-slate-600 mt-1 px-1">{timeLabel}</span>
        )}
      </div>
    </div>
  )
}

/**
 * 答案徽章组件 - 显示 AI 的回答（是/否/无关）
 */
function AnswerBadge({ answer, isDefaultAnswer }: { answer: YesNoIrrelevant; isDefaultAnswer?: boolean }) {
  const config = {
    是: {
      bg: 'bg-emerald-500/20 border-emerald-500/40',
      text: 'text-emerald-400',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    否: {
      bg: 'bg-rose-500/20 border-rose-500/40',
      text: 'text-rose-400',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    无关: {
      bg: 'bg-slate-500/20 border-slate-500/40',
      text: 'text-slate-400',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v2a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  }

  const { bg, text, icon } = config[answer]

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${bg} ${text} font-medium text-sm shadow-sm ${
        isDefaultAnswer ? 'opacity-70' : ''
      }`}
    >
      {icon}
      <span>{answer}</span>
    </div>
  )
}

/**
 * 格式化时间戳为可读格式
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export default Message
