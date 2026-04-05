<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI 海龟汤项目 Agent 开发规范

## 项目概述
- 项目名称：AI 海龟汤游戏网站
- 技术基线：React + TypeScript + Vite + Tailwind CSS + Express
- 核心玩法：玩家提问，主持人只回答 `是` / `否` / `无关`
- 解锁规则：提交最终猜测或主动结束后才可查看汤底

## 开发优先级
1. 优先保证核心玩法可用（创建会话 -> 提问 -> 判定 -> 解锁）
2. 再做体验与视觉优化（大厅、动效、主题）
3. 最后做扩展能力（登录、排行、题库等）

## 代码规范
- 必须使用 TypeScript，避免 `any`，优先 `unknown + type guard`
- 使用函数式组件 + React Hooks
- 样式使用 Tailwind CSS；避免内联硬编码样式
- 组件保持可复用，单文件职责清晰
- 注释只写“为什么”，不写显而易见的“做了什么”

## 命名规范
- 组件名：`PascalCase`
- 函数名/变量名：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 类型名：建议使用语义化命名（如 `Story`, `Session`, `FinalGuess`），不要强制 `T` 前缀

## UI 设计要求
- 整体风格：神秘悬疑，深蓝色调（如 `bg-slate-900`）
- 强调色：金色（如 `text-amber-400`）
- 统一圆角与阴影（如 `rounded-lg` + `shadow-lg`）
- 必须兼容移动端（至少 360px 宽度可用）

## AI 与安全约束
- 主持人回答在可见层必须严格限制为：`是` / `否` / `无关`
- 禁止在未解锁时向前端返回 `truth`
- API Key 禁止硬编码，统一使用环境变量（如 `HF_API_TOKEN`）
- 提示词输出优先 JSON；解析失败需有兜底策略

## 后端与接口约束
- 以服务端状态为准，前端只做展示与交互
- 关键接口（当前实现）：
  - `GET /api/stories` - 获取故事列表
  - `POST /api/session` - 创建会话
  - `GET /api/session/:id` - 获取会话状态
  - `POST /api/session/:id/question` - 提交问题
  - `POST /api/session/:id/final` - 提交最终猜测
  - `POST /api/session/:id/end` - 主动结束游戏（揭晓汤底）
- 非法输入要返回可读错误信息与合适状态码（400/404/500）

## 测试要求
- 每个功能完成后至少手动走通 1 次主流程
- 必测项：
  - 提问返回值仅三选一
  - 提交最终猜测后显示”正确/错误 + 汤底”
  - 未解锁前无法读取汤底
- 发布前执行：`npm run lint` 与 `npm run build`

## 文档同步要求
- 修改需求或范围时同步更新：`PRD.md`
- 修改架构或模块职责时同步更新：`TECH_DESIGN.md` / `ARCHITECTURE.md`
- 修改接口字段时同步更新：`API_SPEC.md`
- 任务与测试变化分别更新：`TASKS.md` / `TESTCASES.md`

## 实施原则
- 保持代码简洁，避免过度设计
- 先可用、再优化、后扩展
- 不确定时优先保持与当前代码结构一致，减少破坏性重构
