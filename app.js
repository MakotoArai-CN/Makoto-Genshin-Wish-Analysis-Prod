/**
 * 应用主入口文件
 * @module app
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import createError from 'http-errors';

import { securityConfig } from './config.js';
import { loadPlugins, configurePluginRoutes } from './plugins.js';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import mainRouter from './routes/main.js';

// ESM 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 Express 应用
const app = express();

// ==================== 安全中间件 ====================

// Helmet 安全头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// 速率限制
const limiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: { error: securityConfig.rateLimit.message },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ==================== 通用中间件 ====================

// 压缩响应
app.use(compression());

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Cookie 解析
app.use(cookieParser());

// ==================== 视图引擎 ====================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ==================== 静态资源 ====================

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
}));

// ==================== 插件系统 ====================

configurePluginRoutes(app, __dirname);

// ==================== 路由 ====================

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/main', mainRouter);

// ==================== 错误处理 ====================

// 404 处理
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

// 全局错误处理
app.use((err, req, res, next) => {
  // 记录错误日志
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  
  // 设置本地变量
  res.locals.message = err.message;
  res.locals.error = app.get('env') === 'development' ? err : {};

  // 渲染错误页面
  res.status(err.status || 500);
  res.render('error');
});

export default app;