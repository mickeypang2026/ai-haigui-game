# AI 海龟汤游戏 - 部署指南

## 项目结构

```
ai-haigui-game/
├── dist/           # 前端构建输出（生产环境）
├── server/         # 后端服务器代码
├── src/            # 前端源代码
├── .env            # 环境变量（不包含在 Git 中）
├── .env.example    # 环境变量模板
└── package.json
```

## 环境变量配置

1. 复制环境变量模板：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入实际的 API 密钥：
   ```env
   # 服务器端口
   PORT=8787

   # 通义千问 API 配置
   QWEN_API_KEY=your_api_key_here
   QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   QWEN_MODEL=qwen-plus

   # 生产环境前端地址（可选）
   FRONTEND_URL=https://your-domain.com
   ```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端同时运行）
npm run dev

# 单独启动前端
npm run dev:web

# 单独启动后端
npm run dev:server
```

## 生产构建

### 前端构建

```bash
# 构建前端
npm run build

# 构建产物在 dist/ 目录
# - index.html
# - assets/index-*.css
# - assets/index-*.js
```

### 后端部署

#### 方案 A：Node.js 服务器部署

1. 确保服务器有 Node.js 18+ 环境
2. 安装依赖：
   ```bash
   npm install --production
   ```
3. 启动服务器：
   ```bash
   npx tsx server/index.ts
   # 或使用 pm2
   pm2 start server/index.ts --name ai-haigui
   ```

#### 方案 B：Docker 部署

创建 `Dockerfile`：
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY server/ ./server/
COPY dist/ ./dist/
EXPOSE 8787
CMD ["npx", "tsx", "server/index.ts"]
```

```bash
docker build -t ai-haigui-game .
docker run -p 8787:8787 --env-file .env ai-haigui-game
```

#### 方案 C：Cloudflare Workers（需适配）

后端代码需要适配 Cloudflare Workers 运行时。

## 前端静态资源部署

可将 `dist/` 目录部署到：

- **Vercel**: `vercel deploy --prod`
- **Netlify**: 拖拽 `dist/` 到 Netlify Drop
- **GitHub Pages**: 使用 `gh-pages` 包
- **Nginx**: 配置静态文件服务

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 前端路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/stories` | GET | 获取故事列表 |
| `/api/session` | POST | 创建新会话 |
| `/api/session/:id` | GET | 获取会话详情 |
| `/api/session/:id/question` | POST | 提交问题 |
| `/api/session/:id/final` | POST | 提交最终猜测 |
| `/api/session/:id/end` | POST | 结束游戏 |

## 故障排查

### 后端启动失败

1. 检查端口是否被占用：
   ```bash
   netstat -ano | findstr :8787
   ```
2. 检查环境变量是否正确配置
3. 查看日志输出

### AI API 调用失败

1. 检查 API Key 是否有效
2. 检查网络连接
3. 查看控制台日志确认降级到本地判断

### CORS 错误

1. 检查 `FRONTEND_URL` 环境变量
2. 确保前端地址在 CORS 允许列表中

## 安全建议

1. **永远不要** 将 `.env` 文件提交到 Git
2. 在生产环境使用 HTTPS
3. 添加请求速率限制（如 `express-rate-limit`）
4. 考虑添加身份验证机制
