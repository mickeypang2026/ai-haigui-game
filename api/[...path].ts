import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ai-haigui-game-production-5e7b.up.railway.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 构建目标 URL
    const targetPath = req.url?.startsWith('/api') ? req.url.slice(4) : req.url;
    const targetUrl = `${BACKEND_URL}/api${targetPath}`;

    // 转发请求到后端
    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // 获取响应数据
    const data = await response.json().catch(() => null);

    // 返回响应
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({
      message: 'Backend service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
