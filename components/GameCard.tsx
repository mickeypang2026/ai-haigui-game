import Link from 'next/link';
import { Story } from '../stories';

interface GameCardProps {
  story: Story;
}

// 难度标签配置
const DIFFICULTY_CONFIG = {
  easy: {
    label: '简单',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  medium: {
    label: '中等',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  hard: {
    label: '困难',
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
};

/**
 * 游戏卡片组件 - 展示单个海龟汤故事
 * 符合神秘悬疑风格，深蓝色调 + 金色强调色
 */
export function GameCard({ story }: GameCardProps) {
  const difficulty = DIFFICULTY_CONFIG[story.difficulty];

  return (
    <Link href={`/game/${story.id}`} className="block group">
      <article className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/30 hover:-translate-y-1">
        {/* 标题 */}
        <h3 className="text-lg font-semibold text-slate-100 mb-3 group-hover:text-amber-400 transition-colors duration-300">
          {story.title}
        </h3>

        {/* 难度标签 */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${difficulty.color}`}>
            {difficulty.label}
          </span>
        </div>

        {/* 汤面预览（截断显示） */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
          {story.surface}
        </p>

        {/* 底部装饰线 - hover 时显示 */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </article>
    </Link>
  );
}

export default GameCard;
