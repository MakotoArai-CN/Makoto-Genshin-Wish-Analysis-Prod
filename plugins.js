/**
 * 插件加载器模块
 * @module plugins
 */

import fs from 'fs';
import path from 'path';
import express from 'express';

/**
 * 比较版本号
 * @param {string} v1 - 版本1
 * @param {string} v2 - 版本2
 * @returns {number}
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = i < parts1.length ? parts1[i] : 0;
    const num2 = i < parts2.length ? parts2[i] : 0;
    
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  
  return 0;
}

/**
 * 检查插件是否包含必需的键
 * @param {object} plugin - 插件对象
 * @returns {boolean}
 */
function hasRequiredKeys(plugin) {
  const requiredKeys = ['author', 'version', 'description', 'pathname', 'name', 'subnav', 'router'];
  return requiredKeys.every(key => key in plugin);
}

/**
 * 加载所有插件
 * @param {string} baseDir - 基础目录
 * @returns {Array}
 */
export async function loadPlugins(baseDir = process.cwd()) {
  const pluginsPath = path.join(baseDir, 'plugins');
  const plugins = [];
  const highestVersions = {};

  if (!fs.existsSync(pluginsPath)) {
    return plugins;
  }

  const pluginDirs = fs.readdirSync(pluginsPath).filter(file => {
    const pluginPath = path.join(pluginsPath, file);
    return fs.lstatSync(pluginPath).isDirectory();
  });

  for (const dir of pluginDirs) {
    const pluginIndexPath = path.join(pluginsPath, dir, 'index.js');
    
    if (!fs.existsSync(pluginIndexPath)) {
      continue;
    }

    try {
      // 动态导入插件（ESM）
      const pluginModule = await import(pluginIndexPath);
      const plugin = pluginModule.default || pluginModule;

      if (!hasRequiredKeys(plugin)) {
        console.warn(`Plugin ${dir} is missing required keys, skipping...`);
        continue;
      }

      const { name, version } = plugin;

      // 保留最高版本
      if (!highestVersions[name] || compareVersions(version, highestVersions[name].version) > 0) {
        highestVersions[name] = {
          name: plugin.name,
          version: plugin.version,
          nav: plugin.subnav.map(subnavItem => ({
            name: subnavItem.name,
            href: subnavItem.href,
          })),
          author: plugin.author,
          description: plugin.description,
          pathname: plugin.pathname,
          router: plugin.router,
          icon: plugin.icon,
        };
      }
    } catch (error) {
      console.error(`Error loading plugin ${dir}:`, error.message);
    }
  }

  return Object.values(highestVersions);
}

/**
 * 同步加载插件（用于非异步上下文）
 * @param {string} baseDir - 基础目录
 * @returns {Array}
 */
export function loadPluginsSync(baseDir = process.cwd()) {
  const pluginsPath = path.join(baseDir, 'plugins');
  const plugins = [];
  const highestVersions = {};

  if (!fs.existsSync(pluginsPath)) {
    return plugins;
  }

  const pluginDirs = fs.readdirSync(pluginsPath).filter(file => {
    const pluginPath = path.join(pluginsPath, file);
    return fs.lstatSync(pluginPath).isDirectory();
  });

  for (const dir of pluginDirs) {
    const pluginIndexPath = path.join(pluginsPath, dir, 'index.js');
    
    if (!fs.existsSync(pluginIndexPath)) {
      continue;
    }

    try {
      // CommonJS 风格同步导入
      const plugin = require(pluginIndexPath);

      if (!hasRequiredKeys(plugin)) {
        continue;
      }

      const { name, version } = plugin;

      if (!highestVersions[name] || compareVersions(version, highestVersions[name].version) > 0) {
        highestVersions[name] = {
          name: plugin.name,
          version: plugin.version,
          nav: plugin.subnav.map(subnavItem => ({
            name: subnavItem.name,
            href: subnavItem.href,
          })),
          author: plugin.author,
          description: plugin.description,
          pathname: plugin.pathname,
          router: plugin.router,
          icon: plugin.icon,
        };
      }
    } catch (error) {
      console.error(`Error loading plugin ${dir}:`, error.message);
    }
  }

  return Object.values(highestVersions);
}

/**
 * 配置插件路由和静态资源
 * @param {import('express').Application} app - Express 应用
 * @param {string} baseDir - 基础目录
 */
export function configurePluginRoutes(app, baseDir) {
  const pluginsPath = path.join(baseDir, 'plugins');
  const mainViewPath = path.join(baseDir, 'views');
  const mainPublicPath = path.join(baseDir, 'public');

  if (!fs.existsSync(pluginsPath)) {
    return;
  }

  const pluginDirs = fs.readdirSync(pluginsPath).filter(file => {
    const pluginPath = path.join(pluginsPath, file);
    return fs.lstatSync(pluginPath).isDirectory();
  });

  for (const pluginName of pluginDirs) {
    const pluginPath = path.join(pluginsPath, pluginName);
    const pluginIndexPath = path.join(pluginPath, 'index.js');

    if (!fs.existsSync(pluginIndexPath)) {
      continue;
    }

    try {
      const plugin = require(pluginIndexPath);
      const pluginRouter = plugin.router;

      if (pluginRouter) {
        // 配置插件路由
        app.use(`/plugins/${pluginName.toLowerCase()}`, pluginRouter);

        // 配置插件静态资源
        const pluginStaticPath = path.join(pluginPath, 'static');
        if (fs.existsSync(pluginStaticPath)) {
          app.use(`/${pluginName.toLowerCase()}`, express.static(pluginStaticPath));
          app.use(`/${pluginName.toLowerCase()}`, express.static(mainPublicPath));
        }

        // 复制插件视图到主视图目录
        const pluginViewsPath = path.join(pluginPath, 'views');
        if (fs.existsSync(pluginViewsPath)) {
          const destViewsPath = path.join(mainViewPath, pluginName);
          copyDirectory(pluginViewsPath, destViewsPath);
        }
      }
    } catch (error) {
      console.error(`Error configuring plugin ${pluginName}:`, error.message);
    }
  }

  // 清理已删除插件的视图
  cleanDeletedPluginViews(mainViewPath, pluginsPath);
}

/**
 * 复制目录
 * @param {string} src - 源目录
 * @param {string} dest - 目标目录
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 清理已删除插件的视图
 * @param {string} mainViewPath - 主视图目录
 * @param {string} pluginsPath - 插件目录
 */
function cleanDeletedPluginViews(mainViewPath, pluginsPath) {
  const existingPlugins = fs.readdirSync(pluginsPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const viewDirs = fs.readdirSync(mainViewPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const viewDir of viewDirs) {
    // 跳过系统目录
    if (['dist', 'GenshinDownload'].includes(viewDir)) {
      continue;
    }

    if (!existingPlugins.includes(viewDir)) {
      const viewPath = path.join(mainViewPath, viewDir);
      if (fs.existsSync(viewPath)) {
        fs.rmSync(viewPath, { recursive: true, force: true });
      }
    }
  }
}

export default {
  loadPlugins,
  loadPluginsSync,
  configurePluginRoutes,
};