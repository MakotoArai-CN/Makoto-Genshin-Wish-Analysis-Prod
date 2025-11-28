/**
 * 用户路由模块
 * @module routes/users
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { getGachaStats } from '../services/gacha.js';
import { isValidUID } from '../utils/validators.js';

const router = express.Router();

/**
 * POST /users - 用户祈愿查询 API
 */
router.post('/',
  body('username').trim().notEmpty().isNumeric(),
  async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        msg: '请输入正确的用户名',
      });
    }

    const uid = parseInt(req.body.username, 10);

    if (!isValidUID(uid)) {
      return res.status(400).json({
        code: 400,
        msg: 'UID格式不正确',
      });
    }

    try {
      const gachaStats = await getGachaStats(uid);

      res.render('user', {
        code: '200',
        ...gachaStats,
      });

    } catch (error) {
      console.error('Error fetching user gacha data:', error);
      res.status(500).json({
        code: 500,
        msg: '服务器内部错误',
      });
    }
  }
);

/**
 * GET /users - 用户页面
 */
router.get('/', (req, res) => {
  res.render('user', {
    title: 'Users List',
    yellowItemsCount301: 0,
    yellowItemsCount302: 0,
    yellowItemsCount100: 0,
    yellowItemsCount400: 0,
    yellowItemsCount200: 0,
    yellowItems301: [],
    yellowItems302: [],
    yellowItems100: [],
    yellowItems400: [],
    yellowItems200: [],
    intervals301: [],
    intervals302: [],
    intervals100: [],
    intervals400: [],
    intervals200: [],
    postYellowCount301: 0,
    postYellowCount302: 0,
    postYellowCount100: 0,
    postYellowCount400: 0,
    postYellowCount200: 0,
  });
});

export default router;