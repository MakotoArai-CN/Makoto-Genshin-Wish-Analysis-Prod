// routers/index.js
var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const { loadPlugins } = require('../plugins');

// //////////
var version_config = {
  "version": require('../package.json').version,
  "type": "Release",
  "description": "Gacha List",
  "daytime": getDayTime()
}

// ////////// 计算白天还是晚上
function getDayTime() {
  var now = new Date();
  var hour = now.getHours();
  if (hour < 6 || hour >= 18) {
    return "0";
  } else {
    return "1";
  }
}

router.get("/", function (req, res, next) {
  // 加载插件
  const plugins = loadPlugins();

  res.render('index', {
    title: version_config.description,
    version: version_config.version,
    type: (version_config.type === "Release" ? "项目开源，请勿用于商业用途" : "测试版内容不代表正式版内容"),
    daytime: version_config.daytime,
    plugins: plugins
  });
});

// 动态加载并注册所有插件的路由
const pluginsDir = path.join(__dirname, '../plugins');
const pluginDirs = fs.readdirSync(pluginsDir).filter(dir => fs.statSync(path.join(pluginsDir, dir)).isDirectory());

pluginDirs.forEach(pluginName => {
  try {
    const pluginRoutesPath = path.join(pluginsDir, pluginName, 'routes', 'index.js');
    const pluginRoutes = require(pluginRoutesPath);
    router.use(`/${pluginName}`, pluginRoutes);
  } catch (error) {
    console.error(`Failed to load routes for plugin ${pluginName}:`, error);
  }
});

module.exports = router;