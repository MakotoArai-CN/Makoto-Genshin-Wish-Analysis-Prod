// plugins.js
const fs = require('fs');
const path = require('path');

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

function hasRequiredKeys(plugin) {
  const requiredKeys = ['author', 'version', 'description', 'pathname', 'name', 'subnav', 'router'];
  return requiredKeys.every(key => key in plugin);
}

function loadPlugins() {
  const pluginsPath = path.join(__dirname, 'plugins');
  const plugins = [];
  const highestVersions = {};

  if (fs.existsSync(pluginsPath)) {
    fs.readdirSync(pluginsPath).forEach(file => {
      const pluginPath = path.join(pluginsPath, file);
      if (fs.lstatSync(pluginPath).isDirectory()) {
        const pluginIndexPath = path.join(pluginPath, 'index.js');

        if (fs.existsSync(pluginIndexPath)) {
          try {
            const pluginModule = require(pluginIndexPath);

            if (hasRequiredKeys(pluginModule)) {
              const { name, version } = pluginModule;

              if (!highestVersions[name] || compareVersions(version, highestVersions[name].version) > 0) {
                highestVersions[name] = {
                  name: pluginModule.name,
                  version: pluginModule.version,
                  nav: pluginModule.subnav.map(subnavItem => ({
                    name: subnavItem.name,
                    href: subnavItem.href
                  })),
                  author: pluginModule.author,
                  description: pluginModule.description,
                  pathname: pluginModule.pathname,
                  router: pluginModule.router,
                  icon: pluginModule.icon
                };
              }
            }
          } catch (error) {
            console.error(`Error loading plugin ${pluginIndexPath}:`, error);
          }
        }
      }
    });
  }

  Object.values(highestVersions).forEach(plugin => {
    plugins.push(plugin);
  });

  return plugins;
}

module.exports = { loadPlugins };