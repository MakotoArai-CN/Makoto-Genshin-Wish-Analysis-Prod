// app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const compression = require('compression');
const fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mainRouter = require('./routes/main');

var app = express();
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 配置静态资源中间件
app.use(express.static(path.join(__dirname, 'public')));

let staticResourceRegistered = false; // 标志变量

// 动态加载并配置插件
function loadAndConfigurePlugins() {
  const pluginsPath = path.join(__dirname, 'plugins');
  if (fs.existsSync(pluginsPath)) {
    fs.readdirSync(pluginsPath).forEach(file => {
      const pluginPath = path.join(pluginsPath, file);
      if (fs.lstatSync(pluginPath).isDirectory()) {
        const plugin = require(pluginPath);
        const pluginName = file.toLowerCase();
        const pluginRouter = plugin.router;

        // 配置插件的路由
        app.use(`/plugins/${pluginName}`, pluginRouter);

        // 配置插件的静态资源目录
        configureStaticResourcesForPlugin(pluginPath, pluginName);

        // 复制插件视图文件到主视图目录
        copyPluginViewsToMain(pluginPath);
      }
    });

    // 确保主程序的静态资源只注册一次
    if (!staticResourceRegistered) {
      app.use(express.static(path.join(__dirname, 'public')));
      staticResourceRegistered = true;
    }
  }
}

// 配置插件的静态资源
function configureStaticResourcesForPlugin(pluginPath, pluginName) {
  const pluginPublicPath = path.join(pluginPath, 'static');
  const mainPublicPath = path.join(__dirname, 'public');  
  app.use(`/${pluginName}`, express.static(pluginPublicPath));
  app.use(`/${pluginName}`, express.static(mainPublicPath));
}

// 删除不再存在的插件视图
function removeDeletedPluginViews() {
  const mainViewPath = path.join(__dirname, 'views');
  const pluginDirs = fs.readdirSync(mainViewPath, {
      withFileTypes: true
    })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const pluginsPath = path.join(__dirname, 'plugins');
  const existingPlugins = fs.readdirSync(pluginsPath, {
      withFileTypes: true
    })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  existingPlugins.forEach(pluginDir => {
    const pluginViewsPath = path.join(pluginsPath, pluginDir, 'views');
    if (!fs.existsSync(pluginViewsPath)) {
      const mainPluginViewPath = path.join(mainViewPath, pluginDir);
      if (fs.existsSync(mainPluginViewPath)) {
        fs.rmSync(mainPluginViewPath, {
          recursive: true,
          force: true
        });
      }
    }
  });

  pluginDirs.forEach(pluginDir => {
    if (!existingPlugins.includes(pluginDir)) {
      const mainPluginViewPath = path.join(mainViewPath, pluginDir);
      if (fs.existsSync(mainPluginViewPath)) {
        fs.rmSync(mainPluginViewPath, {
          recursive: true,
          force: true
        });
      }
    }
  });
}

// 复制插件视图文件到主视图目录
async function copyPluginViewsToMain(pluginPath) {
  const pluginViewsPath = path.join(pluginPath, 'views');
  const mainViewPath = path.join(__dirname, 'views');

  const pluginName = path.basename(pluginPath);
  const destViewsPath = path.join(mainViewPath, pluginName);

  // 视图文件夹处理
  if (fs.existsSync(pluginViewsPath)) {
    // 如果目标目录不存在，则创建
    if (!fs.existsSync(destViewsPath)) {
      fs.mkdirSync(destViewsPath, {
        recursive: true
      });
    }

    // 清除已有的插件视图目录
    if (fs.existsSync(destViewsPath)) {
      await clearDirectory(destViewsPath);
    }

    // 使用 fs.promises.cp 复制整个目录
    try {
      await fs.promises.cp(pluginViewsPath, destViewsPath, {
        recursive: true
      });
    } catch (error) {
      console.error(`Error copying views for ${pluginName}:`, error);
    }
  }
}

// 清除目录中的所有文件和子目录
async function clearDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath, {
    withFileTypes: true
  });
  for (const file of files) {
    const filePath = path.join(directoryPath, file.name);
    if (file.isDirectory() && file.name !== '.git') { // 跳过 .git 目录
      await clearDirectory(filePath);
      fs.rmdirSync(filePath);
    } else if (!file.isDirectory()) {
      fs.unlinkSync(filePath);
    }
  }
}

loadAndConfigurePlugins();
removeDeletedPluginViews();

// 其他中间件
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

// 路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/main', mainRouter);

// 错误处理
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;