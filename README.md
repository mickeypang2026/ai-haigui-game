# AI 海龟汤游戏 🎮

一个基于 Web 的**情境推理游戏（海龟汤）**应用，用户通过提问"是/否/无关"问题来推理故事真相，AI 作为主持人自动回答。

![部署状态](https://img.shields.io/badge/前端-Vercel-success)
![部署状态](https://img.shields.io/badge/后端-Railway-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 什么是海龟汤？

**海龟汤（Turtle Soup）** 是一种情境推理游戏，也被称为"是/否游戏"或"水平思考谜题"。

### 游戏规则

1. 主持人展示一个不完整的故事（**汤面**）
2. 玩家通过提问来推理真相
3. 主持人只能回答：**是** / **否** / **无关**
4. 玩家猜出完整真相（**汤底**）即获胜

### 示例

> **汤面**：一个男人走进餐厅，点了一碗海龟汤。他喝了一口后自杀了。为什么？
>
> **汤底**：男人曾和父亲在海上遇难，父亲给他一碗"肉汤"救了他，自己却死了。父亲说那是海龟汤。多年后在餐厅，他发现真正的海龟汤味道完全不同，意识到当年喝的是父亲的肉，无法承受真相而自杀。

---

## ✨ 功能特性

### 🎯 核心玩法
- ✅ 10 个精选海龟汤故事（3 简单 / 4 中等 / 3 困难）
- ✅ 无限次提问推理
- ✅ 最终猜测机制
- ✅ 一键揭晓汤底

### 🤖 AI 主持人
- ✅ 智能语义理解（通义千问）
- ✅ 优化的 Prompt 指令系统
- ✅ 不规范回答自动降级处理
- ✅ 核心事实匹配算法

### 🎨 用户界面
- ✅ 响应式设计（支持移动端）
- ✅ 暗黑主题风格
- ✅ 流畅的动画效果
- ✅ 实时对话记录

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | React 19 + TypeScript |
| **构建工具** | Vite 8 |
| **样式方案** | TailwindCSS 4 |
| **路由管理** | React Router v7 |
| **后端框架** | Node.js + Express 5 |
| **AI 接口** | 通义千问 (Qwen) / 兼容 Claude |
| **前端部署** | Vercel |
| **后端部署** | Railway |

---

## 📁 项目结构

```
ai-haigui-game/
├── src/                        # 前端源代码
│   ├── pages/
│   │   ├── Home.tsx           # 首页 - 故事列表
│   │   ├── Game.tsx           # 游戏页面 - 提问推理
│   │   └── Result.tsx         # 结果页面 - 揭晓真相
│   ├── components/
│   │   ├── ChatBox.tsx        # 对话组件
│   │   ├── Message.tsx        # 消息组件
│   │   └── ...
│   └── lib/
│       ├── api.ts             # 前端 API 调用
│       ├── types.ts           # 类型定义
│       └── aiApi.ts           # AI API 封装
│
├── server/                     # 后端服务器
│   ├── index.ts               # 主服务器 + 游戏路由
│   ├── aiJudge.ts             # AI 语义判断逻辑
│   ├── aiApi.ts               # AI API 调用
│   ├── gameStore.ts           # 内存存储
│   ├── stories.ts             # 故事数据
│   └── types.ts               # 类型定义
│
├── public/                     # 静态资源
├── .env.example                # 环境变量模板
├── vercel.json                 # Vercel 部署配置
├── railway.json                # Railway 部署配置
├── DEPLOY.md                   # 部署指南
└── README.md                   # 本文件
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm / pnpm / yarn
- 通义千问 API Key（或 Claude API Key）

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入 API Key
QWEN_API_KEY=your_api_key_here
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
```

### 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 单独启动前端
npm run dev:web

# 单独启动后端
npm run dev:server
```

访问：http://localhost:5173

### 生产构建

```bash
# 构建前端
npm run build

# 预览构建结果
npm run preview
```

---

## 📊 游戏内容

### 故事列表

| ID | 标题 | 难度 | 主题 |
|----|------|------|------|
| story-001 | 半夜的敲门声 | 🟢 简单 | 盲人/导盲犬 |
| story-002 | 红色的水 | 🟡 中等 | 兄妹/牺牲 |
| story-003 | 电梯里的男人 | 🟢 简单 | 侏儒/按钮 |
| story-004 | 消失的子弹 | 🔴 困难 | 马戏团/吞子弹 |
| story-005 | 空房间的脚步声 | 🟡 中等 | 孕妇/胎儿 |
| story-006 | 海龟汤 | 🟢 简单 | 父子/海上遇难 |
| story-007 | 雨夜的广播 | 🟡 中等 | 杀人魔/车后座 |
| story-008 | 镜子里的女人 | 🟡 中等 | 盲人/角膜移植 |
| story-009 | 生日蛋糕 | 🔴 困难 | 糖尿病/母爱 |
| story-010 | 最后一班地铁 | 🔴 困难 | 司机/牺牲 |

### 难度说明

- **🟢 简单**：线索明显，适合新手
- **🟡 中等**：需要一定的推理能力
- **🔴 困难**：核心诡计复杂，老手挑战

---

## 🔌 API 文档

### 后端 API 端点

| 端点 | 方法 | 描述 | 参数 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | - |
| `/api/stories` | GET | 获取故事列表 | - |
| `/api/session` | POST | 创建新会话 | `{ storyId?: string }` |
| `/api/session/:id` | GET | 获取会话详情 | - |
| `/api/session/:id/question` | POST | 提交问题 | `{ question: string }` |
| `/api/session/:id/final` | POST | 提交最终猜测 | `{ guess: string }` |
| `/api/session/:id/end` | POST | 结束游戏 | - |

### 响应示例

**创建会话**
```json
// POST /api/session
// Body: { "storyId": "story-001" }

{
  "id": "uuid-string-here"
}
```

**获取会话详情**
```json
// GET /api/session/:id

{
  "id": "uuid-string-here",
  "storyTitle": "半夜的敲门声",
  "story": "一个男人独自住在公寓里...",
  "conversation": [],
  "truthUnlocked": false
}
```

**提交问题**
```json
// POST /api/session/:id/question
// Body: { "question": "故事里有人死了吗？" }

{
  "id": "uuid-string-here",
  "conversation": [
    {
      "question": "故事里有人死了吗？",
      "answer": "是",
      "createdAt": 1234567890
    }
  ],
  "truthUnlocked": false
}
```

---

## 🏗️ 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                     用户浏览器                           │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Vercel 前端   │     │  Railway 后端   │
│  (静态资源)     │────▶│  (Express API)  │
│                 │     │                 │
│ - React SPA     │     │ - AI 判断       │
│ - TailwindCSS   │◀────│ - 游戏逻辑      │
└─────────────────┘     │ - 内存存储      │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  通义千问 API   │
                        │  (AI 模型)      │
                        └─────────────────┘
```

### 数据流

```
用户提问 → 前端 → API → 后端 → AI Judge → 通义千问 → 返回答案
                                            ↓
                                      (降级：本地判断)
```

---

## 🎯 核心技术亮点

### 1. AI Prompt 优化

```typescript
// server/aiJudge.ts
const userPrompt = `你是一个海龟汤（情境推理游戏）的主持人...

## 输出规则
你必须且只能从以下三个答案中选择一个：
- "是"：问题描述的情况与真相一致
- "否"：问题描述的情况与真相矛盾
- "无关"：问题无法从真相中推断

## 示例
真相：小明是个盲人，他养的导盲犬是他唯一的伙伴。
问题：小明看不见吗？
答案：是
...
`
```

### 2. 默认回答处理

```typescript
// server/index.ts
if (!isValidAnswer(answer)) {
  console.warn('AI 回答不规范，使用默认回答 "无关"')
  answer = '无关'
  isDefaultAnswer = true
}
```

### 3. 最终猜测判断

```typescript
// server/aiJudge.ts
// 核心事实匹配原则
// - 70% 实体权重 + 30% 动作权重
// - 允许表述差异，关注"什么发生了"而不是"怎么描述"
const totalScore = (entityScore * 0.7 + actionScore * 0.3)
const result = totalScore >= 0.5  // 50% 相似度即认为猜对
```

---

## 🌐 线上环境

| 服务 | 地址 |
|------|------|
| **前端** | https://ai-haigui-game-alpha.vercel.app |
| **后端** | https://ai-haigui-game-production-5e7b.up.railway.app |
| **代码仓库** | https://github.com/mickeypang2026/ai-haigui-game |

---

## 📦 部署指南

### Vercel 前端部署

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库 `mickeypang2026/ai-haigui-game`
3. 点击 "Deploy"
4. 自动构建和部署

### Railway 后端部署

1. 访问 https://railway.app
2. 创建新项目，选择 "Deploy from GitHub"
3. 添加环境变量：
   - `QWEN_API_KEY` = 你的 API Key
   - `QWEN_BASE_URL` = `https://dashscope.aliyuncs.com/compatible-mode/v1`
   - `QWEN_MODEL` = `qwen-plus`
4. 设置 Start Command: `npx tsx server/index.ts`
5. 部署完成

详细部署指南请参阅 [DEPLOY.md](./DEPLOY.md)

---

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev              # 同时启动前后端
npm run dev:web          # 仅前端
npm run dev:server       # 仅后端

# 构建
npm run build            # 生产构建
npm run preview          # 预览构建结果

# 代码质量
npm run lint             # ESLint 检查
npm run typecheck        # TypeScript 类型检查
```

---

## 📝 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | `8787` |
| `QWEN_API_KEY` | 通义千问 API Key | - |
| `QWEN_BASE_URL` | API 基础 URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `QWEN_MODEL` | 模型名称 | `qwen-plus` |
| `FRONTEND_URL` | 前端地址（CORS） | - |

---

## 📄 License

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

## 📞 联系方式

- **作者**: mickeypang2026
- **仓库**: https://github.com/mickeypang2026/ai-haigui-game

---

## 🙏 致谢

- 海龟汤游戏灵感来源于经典派对游戏
- AI 能力由通义千问提供
- 感谢所有贡献者

---

<div align="center">

**🎮 现在开始你的推理之旅吧！**

[访问游戏](https://ai-haigui-game-alpha.vercel.app) | [查看代码](https://github.com/mickeypang2026/ai-haigui-game) | [部署文档](./DEPLOY.md)

</div>
