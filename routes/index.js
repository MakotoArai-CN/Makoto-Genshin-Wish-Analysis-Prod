/**
 * 主路由模块
 * @module routes/index
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadPluginsSync } from '../plugins.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 版本配置
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);

const versionConfig = {
  version: packageJson.version,
  type: 'Release',
  description: 'Gacha List',
};

/**
 * 获取当前是白天还是夜晚
 * @returns {string} "0" 表示夜晚，"1" 表示白天
 */
function getDayTime() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? '1' : '0';
}

/**
 * 首页路由
 */
router.get('/', (req, res) => {
  const plugins = loadPluginsSync(path.join(__dirname, '..'));
  
  res.render('index', {
    title: versionConfig.description,
    version: versionConfig.version,
    type: versionConfig.type === 'Release' 
      ? '项目开源，请勿用于商业用途' 
      : '测试版内容不代表正式版内容',
    daytime: getDayTime(),
    plugins,
  });
});

// 动态加载插件路由
const pluginsDir = path.join(__dirname, '../plugins');

if (fs.existsSync(pluginsDir)) {
  const pluginDirs = fs.readdirSync(pluginsDir).filter(dir => 
    fs.statSync(path.join(pluginsDir, dir)).isDirectory()
  );

  for (const pluginName of pluginDirs) {
    const pluginRoutesPath = path.join(pluginsDir, pluginName, 'routes', 'index.js');
    
    if (fs.existsSync(pluginRoutesPath)) {
      try {
        const pluginRoutes = require(pluginRoutesPath);
        router.use(`/${pluginName}`, pluginRoutes);
      } catch (error) {
        console.error(`Failed to load routes for plugin ${pluginName}:`, error.message);
      }
    }
  }
}

export default router;