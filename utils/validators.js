/**
 * 输入验证工具
 * @module utils/validators
 */

import { body, param, query, validationResult } from 'express-validator';
import xss from 'xss';

/**
 * 处理验证错误
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
}

/**
 * UID 验证规则
 */
export const validateUID = [
  body('UID')
    .trim()
    .notEmpty()
    .withMessage('UID不能为空')
    .isNumeric()
    .withMessage('UID必须为数字')
    .isLength({ min: 1, max: 15 })
    .withMessage('UID长度不合法')
    .customSanitizer(value => parseInt(value, 10)),
];

/**
 * 搜索查询验证规则
 */
export const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('搜索内容过长')
    .customSanitizer(value => xss(value)),
];

/**
 * 清理 XSS
 * @param {string} input - 输入字符串
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  return xss(input);
}

/**
 * 验证是否为有效的 UID
 * @param {any} uid - 待验证的 UID
 * @returns {boolean}
 */
export function isValidUID(uid) {
  const numUID = parseInt(uid, 10);
  return !isNaN(numUID) && numUID > 0 && numUID < 10000000000;
}

export default {
  handleValidationErrors,
  validateUID,
  validateSearchQuery,
  sanitizeInput,
  isValidUID,
};