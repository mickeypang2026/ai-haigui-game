# AI 海龟汤游戏技术设计文档（整合优化版）

## 1. 文档目标
本设计文档用于指导 AI 海龟汤游戏的工程落地，覆盖：
- 技术选型与架构方案
- 代码目录与模块职责
- 数据模型与状态流
- AI 调用与 Prompt 约束
- 接口设计、异常处理与安全策略
- 性能、监控与部署建议

---

## 2. 技术栈设计

## 2.1 推荐方案（与当前项目一致，优先）
- 前端：`Next.js + React + TypeScript`
- 样式：`Tailwind CSS`
- 状态管理：`React Hooks`（`useState` / `useMemo` / `useEffect`）
- 路由：`Next.js App Router`
- 后端：`Next.js Route Handlers`（`/api/*`）
- AI Provider：`Hugging Face / DeepSeek / 智谱AI`（支持可配置切换）
- 部署：`Vercel`

> 说明：MVP 阶段采用前后端同栈可以降低复杂度（无需单独 Express、无需跨域、部署链路更短）。

## 2.2 兼容方案（按你模板）
- 前端：`React + TypeScript + Vite`
- 路由：`React Router`
- 后端：`Node.js + Express`
- 样式：`Tailwind CSS`
- AI：`DeepSeek / 智谱AI`

> 适用场景：若你后续计划拆分独立前后端团队，可考虑该方案。

---

## 3. 系统架构

## 3.1 逻辑分层
1. **表现层（UI）**
   - 大厅页、会话页、揭晓区块
   - 负责输入与展示，不直接持有汤底真相

2. **应用层（API）**
   - 会话创建、提问判定、最终猜测、会话状态查询
   - 负责业务规则和权限控制（何时可解锁汤底）

3. **领域层（Game + AI）**
   - 游戏状态机：`questioning -> revealed`
   - AI 规则：严格输出 `是/否/无关` 或 `correct:boolean`

4. **基础设施层（Storage + Provider）**
   - 存储：本地 JSON（MVP）
   - 模型调用：Provider 适配层（HF/DeepSeek/智谱）

## 3.2 关键原则
- 汤底 `truth` 在解锁前禁止返回前端。
- 主持人回答必须被后端约束为三值集合。
- 所有 AI 输出先结构化解析，再转换为业务结果。

---

## 4. 项目结构设计

## 4.1 推荐结构（Next.js）
```txt
src/
  app/
    page.tsx                      # 首页/大厅（后续扩展卡片列表）
    session/[id]/page.tsx         # 游戏页面（聊天+最终猜测+揭晓）
    api/
      session/route.ts            # 创建会话
      session/[id]/route.ts       # 获取会话状态
      session/[id]/question/route.ts # 提问判定
      session/[id]/final/route.ts    # 最终猜测
  lib/
    aiTurtle.ts                   # Prompt 与业务判定逻辑
    hfInference.ts                # Provider 调用适配
    gameStore.ts                  # 会话读写与状态持久化
```

## 4.2 你模板对应结构（Vite + React）
```txt
src/
  components/
    GameCard.tsx
    ChatBox.tsx
    Message.tsx
    StoryReveal.tsx
  pages/
    Home.tsx
    Game.tsx
    Result.tsx
  data/
    stories.ts
  App.tsx
  main.tsx
```

---

## 5. 数据模型设计

## 5.1 Story（题目）
- `id: string`
- `title: string`
- `difficulty: "easy" | "medium" | "hard"`
- `surface: string`（汤面）
- `bottom: string`（汤底）

- 提问数无上限，玩家可自由提问直到提交最终猜测或主动结束游戏。

---

## 6. 核心流程设计

1. 玩家进入大厅并开始游戏。
2. 服务端创建会话并生成 `story + truth`。
3. 前端展示 `story`，玩家输入问题。
4. 服务端携带 `truth + question + 历史上下文` 调用 AI，得到 `是/否/无关`。
5. 记录历史并返回前端展示。
6. 满足任一条件解锁汤底：
   - 提交最终猜测；
   - 点击”结束游戏”。
7. 揭晓区显示：
   - 提交最终猜测时：`正确/错误 + 汤底`
   - 非最终猜测解锁时：`汤底`

---

## 7. API 设计（MVP）

## 7.1 创建会话
- `POST /api/session`
- request:
```json
{}
```
- response:
```json
{ "id": "session_id" }
```

## 7.2 获取会话
- `GET /api/session/:id`
- 未解锁：
```json
{
  "id": "xxx",
  "story": "...",
  "conversation": [],
  "truthUnlocked": false
}
```
- 已解锁：
```json
{
  "id": "xxx",
  "story": "...",
  "conversation": [],
  "truthUnlocked": true,
  "truth": "...",
  "finalGuess": { "guess": "...", "correct": true, "createdAt": 0 }
}
```

## 7.3 提问判定
- `POST /api/session/:id/question`
- request:
```json
{ "question": "他是自杀吗？" }
```
- response:
```json
{
  "conversation": [
    { "question": "他是自杀吗？", "answer": "否", "createdAt": 0 }
  ],
  "truthUnlocked": false
}
```

## 7.4 最终猜测
- `POST /api/session/:id/final`
- request:
```json
{ "guess": "我认为是..." }
```
- response:
```json
{
  "truth": "...",
  "finalGuess": { "guess": "我认为是...", "correct": false, "createdAt": 0 }
}
```

---

## 8. AI Prompt 设计（优化版）

## 8.1 主持人判定 Prompt（是/否/无关）
```txt
你是海龟汤主持人。你有以下信息：
- 汤面：{surface}
- 汤底：{bottom}
- 历史对话：{history}
- 玩家问题：{question}

请严格根据汤底判断，并只输出 JSON：
{ "label": "是" | "否" | "无关" }

规则：
1) 只能是三选一，禁止输出解释
2) 无法从汤底确定时返回“无关”
3) 禁止泄露汤底细节
```

## 8.2 最终猜测评估 Prompt
```txt
你是海龟汤主持人。请判断玩家最终猜测是否与汤底关键结论一致。
只输出 JSON：{ "correct": true | false }

汤底：{bottom}
猜测：{guess}
```

## 8.3 解析与容错
- 先尝试直接 `JSON.parse`
- 失败则提取最外层 `{...}` 再解析
- 仍失败时：
  - 提问判定默认 `无关`（保守）
  - 最终猜测默认 `false`
- 建议后续加入重试（最多 2 次）

---

## 9. 状态管理设计

前端局部状态（会话页）：
- `session`: 当前会话数据
- `question`: 问题输入
- `finalGuess`: 最终猜测输入
- `loading/busy/error`: UI 反馈状态

状态转换：
- 初始化：`loading -> loaded`
- 发送问题：`busy=true -> 更新conversation -> busy=false`
- 提交猜测：`busy=true -> truthUnlocked=true -> busy=false`

---

## 10. 安全与权限控制
- 解锁前 API 不返回 `truth` 字段。
- 所有判定在服务端完成，前端不持有判定规则实现。
- 对输入进行基本校验：
  - `question/guess` 不能为空
- 防止重复提交：`finalGuess` 一旦存在，拒绝二次写入。

---

## 11. 性能与稳定性
- 请求超时控制：建议 10~20s 超时兜底。
- 并发控制：同会话关键写操作串行。
- 响应目标：
  - 创建会话 < 5s（受 AI 生成影响）
  - 单次问答 < 5s
- 失败提示：前端统一可读错误文案 + 重试机制。

---

## 12. 监控与日志建议
- 指标：
  - 会话创建成功率
  - 问答成功率
  - AI 调用平均耗时
  - JSON 解析失败率
  - 会话完成率（是否走到揭晓）
- 日志字段：
  - `sessionId`、`endpoint`、`provider`、`latencyMs`、`errorType`

---

## 13. 部署与配置
- 环境变量：
  - `HF_API_TOKEN` 或 `DEEPSEEK_API_KEY` 或 `ZHIPU_API_KEY`
  - `AI_PROVIDER`（可选，默认 HF）
  - `AI_MODEL`（可选）
- 部署平台：`Vercel`
- 存储：
  - MVP 可用本地文件（开发）
  - 生产建议迁移至 DB（PostgreSQL / Redis / MongoDB）

---

## 14. 迭代路线（技术视角）
- V1：单局玩法闭环（已完成主链路）
- V1.1：大厅卡片 + 结束游戏 + 再来一局
- V1.2：AI 重试机制 + 埋点日志
- V2：账号系统 + 历史战绩 + 排行榜
- V3：多人协作/对战 + 自定义题库

