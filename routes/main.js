/**
 * 祈愿主路由模块
 * @module routes/main
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { checkUserExists, getUserInfo, getGachaStats } from '../services/gacha.js';
import { isDatabaseConnected } from '../services/database.js';
import { isValidUID, sanitizeInput } from '../utils/validators.js';

const router = express.Router();

/**
 * 生成错误页面 HTML
 * @param {string} title - 标题
 * @param {string} message - 消息
 * @param {string} type - 类型 (danger/warning/info)
 * @returns {string}
 */
function generateErrorPage(title, message, type = 'warning') {
  const iconMap = {
    danger: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
  
  return `
    <link rel="stylesheet" type="text/css" href="css/materialdesignicons.min.css">
    <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="css/animate.min.css">
    <link rel="stylesheet" type="text/css" href="js/bootstrap-multitabs/multitabs.min.css">
    <link rel="stylesheet" type="text/css" href="css/style.min.css">
    <body>
    <div class="container p-4">
      <div class="card border-${type} text-center p-4">
        <div class="card-header text-${type}">
          ${iconMap[type] || '⚠️'} ${type === 'danger' ? '错误' : type === 'info' ? '提示' : '警告'}
        </div>
        <div class="card-body">
          <h5 class="card-title">${sanitizeInput(title)}</h5>
          <p class="card-text">${sanitizeInput(message)}</p>
          <button class="btn btn-primary" onclick="parent.location.reload();">重新输入</button>
        </div>
      </div>
    </div>
    </body>
    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/popper.min.js"></script>
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/perfect-scrollbar.min.js"></script>
    <script type="text/javascript" src="js/bootstrap-multitabs/multitabs.min.js"></script>
    <script type="text/javascript" src="js/jquery.cookie.min.js"></script>
    <script type="text/javascript" src="js/index.min.js"></script>
  `;
}

/**
 * 生成默认的祈愿数据
 * @returns {object}
 */
function getDefaultGachaData() {
  return {
    yellowItemsCount301: 0,
    yellowItemsCount302: 0,
    yellowItemsCount100: 0,
    yellowItemsCount400: 0,
    yellowItemsCount200: 0,
    yellowItemsCountYellowTotal: 0,
    yellowItems301: [],
    yellowItems302: [],
    yellowItems100: [],
    yellowItems400: [],
    yellowItems200: [],
    yellowItemsYellowTotal: [],
    intervals301: [],
    intervals302: [],
    intervals100: [],
    intervals400: [],
    intervals200: [],
    intervalsYellowTotal: [],
    postYellowCount301: 0,
    postYellowCount302: 0,
    postYellowCount100: 0,
    postYellowCount400: 0,
    postYellowCount200: 0,
    postYellowCountYellowTotal: 0,
    resultstoday: 0,
    resultsgachacount: 0,
    username: '',
  };
}

/**
 * POST /main - 查询祈愿数据
 */
router.post('/',
  body('UID').trim().notEmpty().isNumeric(),
  async (req, res) => {
    // 检查数据库连接
    if (!isDatabaseConnected()) {
      return res.send(generateErrorPage(
        '数据库未连接',
        '服务器数据库服务未启动，请联系管理员启动 MongoDB 服务后重试。',
        'warning'
      ));
    }

    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(generateErrorPage(
        'UID格式错误',
        '请检查您的UID是否正确，输入正确的UID才行哦！！！',
        'danger'
      ));
    }

    const uid = parseInt(req.body.UID, 10);

    // 验证 UID 范围
    if (!isValidUID(uid)) {
      return res.send(generateErrorPage(
        'UID不合法',
        '请输入有效的UID！！！',
        'danger'
      ));
    }

    try {
      // 检查用户是否存在
      const userExists = await checkUserExists(uid);
      if (!userExists) {
        return res.send(generateErrorPage(
          '用户不存在！',
          '请检查您的UID是否正确，输入正确的UID才行哦！！！',
          'warning'
        ));
      }

      // 获取用户信息
      const userInfo = await getUserInfo(uid);
      
      // 获取祈愿统计数据
      const gachaStats = await getGachaStats(uid);

      // 渲染页面
      res.render('main', {
        title: 'Gacha List',
        status: true,
        UID: uid,
        username: userInfo?.username || '旅行者',
        ...gachaStats,
      });

    } catch (error) {
      console.error('Error fetching gacha data:', error);
      
      // 根据错误类型返回不同消息
      if (error.code === 'DB_NOT_CONNECTED') {
        return res.send(generateErrorPage(
          '数据库连接断开',
          '请稍后重试或联系管理员。',
          'warning'
        ));
      }
      
      res.send(generateErrorPage(
        '服务器出现错误！',
        '请联系您的服务管理人员进行维护哦！！！',
        'warning'
      ));
    }
  }
);

/**
 * GET /main - 显示祈愿查询页面
 */
router.get('/', (req, res) => {
  const dbConnected = isDatabaseConnected();
  
  res.render('main', {
    title: 'Gacha List',
    status: false,
    dbConnected, // 传递数据库状态到模板
    ...getDefaultGachaData(),
  });
});

export default router;