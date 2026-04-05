export interface MessageProps {
  question: string
  answer: string
  timestamp: number
  index: number
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function Message({ question, answer, timestamp, index }: MessageProps) {
  return (
    <div className="space-y-2">
      {/* 玩家问题 */}
      <div
        className="flex justify-end opacity-0 animate-slide-in-right"
        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
      >
        <div className="max-w-[85%] sm:max-w-[80%] rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 px-4 py-2 text-slate-900 shadow-md transition-shadow hover:shadow-lg">
          <div className="text-sm font-medium">{question}</div>
          <div className="mt-1 text-xs opacity-60">{formatTime(timestamp)}</div>
        </div>
      </div>

      {/* 主持人回答 */}
      <div
        className="flex justify-start opacity-0 animate-slide-in-left"
        style={{ animationDelay: `${index * 0.05 + 0.15}s`, animationFillMode: 'forwards' }}
      >
        <div className="max-w-[85%] sm:max-w-[80%] rounded-lg bg-slate-800 px-4 py-2 text-slate-100 shadow-md transition-shadow hover:shadow-lg">
          <div className="text-sm">
            <span className="font-medium text-amber-400">主持人：</span>
            <span className="ml-1">{answer}</span>
          </div>
          <div className="mt-1 text-xs opacity-60">{formatTime(timestamp)}</div>
        </div>
      </div>
    </div>
  )
}

export default Message
