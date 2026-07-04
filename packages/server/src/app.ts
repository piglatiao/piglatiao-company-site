import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

const app = express();

// 安全中间件
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (config.cors.isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin not allowed: ${origin || 'unknown'}`));
    },
    credentials: true,
  }),
);

// 请求解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, error: { code: 'RATE_LIMIT', message: '请求过于频繁' } },
  }),
);

// 登录接口单独限流
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, error: { code: 'RATE_LIMIT', message: '登录尝试过于频繁' } },
  }),
);

// API 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
const server = app.listen(config.port, config.host, () => {
  console.log(`\n🚀 NoteApp API Server running on http://${config.host}:${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS origins: ${config.cors.origin.join(', ')}`);
  console.log(`📡 LAN access: localhost、127.0.0.1、局域网 IP 已允许访问`);
  console.log(`\n📋 API Routes:`);
  console.log(`   Public:  /api/public/*`);
  console.log(`   Auth:    /api/auth/*`);
  console.log(`   Admin:   /api/admin/* (requires JWT)`);
  console.log(`   Health:  /health\n`);
});

export default server;
