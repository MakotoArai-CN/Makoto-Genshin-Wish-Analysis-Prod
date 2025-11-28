/**
 * 祈愿数据服务模块
 * @module services/gacha
 */

import { getCollection, isDatabaseConnected } from './database.js';
import { mappings } from '../config.js';

/**
 * 获取今日日期格式化字符串
 * @returns {string}
 */
function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取明日日期格式化字符串
 * @returns {string}
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().substring(0, 10);
}

/**
 * 检查数据库连接状态
 * @throws {Error} 如果数据库未连接
 */
function ensureDatabaseConnected() {
  if (!isDatabaseConnected()) {
    const error = new Error('数据库未连接，请确保 MongoDB 服务正在运行');
    error.code = 'DB_NOT_CONNECTED';
    throw error;
  }
}

/**
 * 检查用户是否存在
 * @param {number} uid - 用户ID
 * @returns {Promise<boolean>}
 */
export async function checkUserExists(uid) {
  ensureDatabaseConnected();
  
  const accountsCollection = getCollection('accounts');
  const count = await accountsCollection.countDocuments({ _id: String(uid) });
  return count > 0;
}

/**
 * 获取用户信息
 * @param {number} uid - 用户ID
 * @returns {Promise<object|null>}
 */
export async function getUserInfo(uid) {
  ensureDatabaseConnected();
  
  const accountsCollection = getCollection('accounts');
  const user = await accountsCollection.findOne({ _id: String(uid) });
  return user;
}

/**
 * 处理祈愿结果，提取五星物品信息
 * @param {Array} results - 祈愿结果数组
 * @param {number|null} gachaType - 卡池类型
 * @returns {object}
 */
function processGachaResults(results, gachaType) {
  let lastYellowIndex = -1;
  const yellowItems = [];
  const intervals = [];
  let postYellowCount = 0;

  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    const mapping = mappings[item.itemID];

    // 如果 gachaType 为 null，不检查卡池类型
    const typeMatch = gachaType === null || item.gachaType === gachaType;

    if (mapping && mapping[1] === 'yellow' && typeMatch) {
      yellowItems.push({
        itemID: item.itemID,
        gachaType: item.gachaType,
        0: mapping[0],
        1: mapping[1],
      });

      if (lastYellowIndex >= 0) {
        intervals.push(i - lastYellowIndex);
      }
      lastYellowIndex = i;
    }
  }

  if (lastYellowIndex !== -1) {
    postYellowCount = results.length - lastYellowIndex - 1;
  }

  return {
    yellowItems,
    intervals,
    postYellowCount,
    count: yellowItems.length,
  };
}

/**
 * 获取祈愿统计数据
 * @param {number} uid - 用户ID
 * @returns {Promise<object>}
 */
export async function getGachaStats(uid) {
  ensureDatabaseConnected();
  
  const gachaCollection = getCollection('gachas');

  // 并行查询各卡池数据
  const [results301, results302, results100, results400, results200] = await Promise.all([
    gachaCollection.find({ ownerId: uid, gachaType: 301 }).sort({ transactionDate: 1 }).toArray(),
    gachaCollection.find({ ownerId: uid, gachaType: 302 }).sort({ transactionDate: 1 }).toArray(),
    gachaCollection.find({ ownerId: uid, gachaType: 100 }).sort({ transactionDate: 1 }).toArray(),
    gachaCollection.find({ ownerId: uid, gachaType: 400 }).sort({ transactionDate: 1 }).toArray(),
    gachaCollection.find({ ownerId: uid, gachaType: 200 }).sort({ transactionDate: 1 }).toArray(),
  ]);

  // 今日抽卡数和总抽卡数
  const [todayCount, totalCount] = await Promise.all([
    gachaCollection.countDocuments({
      ownerId: uid,
      transactionDate: {
        $gte: new Date(getTodayDate()),
        $lt: new Date(getTomorrowDate()),
      },
    }),
    gachaCollection.countDocuments({ ownerId: uid }),
  ]);

  // 最近1000次祈愿的五星数据
  const recentYellowTotal = await gachaCollection
    .find({
      ownerId: uid,
      $or: [{ gachaType: 301 }, { gachaType: 302 }, { gachaType: 400 }],
    })
    .sort({ transactionDate: -1 })
    .limit(1000)
    .toArray();

  // 处理各卡池数据
  const processed301 = processGachaResults(results301, 301);
  const processed302 = processGachaResults(results302, 302);
  const processed100 = processGachaResults(results100, 100);
  const processed400 = processGachaResults(results400, 400);
  const processed200 = processGachaResults(results200, 200);

  // 处理总五星数据（不区分卡池）
  const processedTotal = processGachaResults(recentYellowTotal, null);

  return {
    // 五星数量
    yellowItemsCount301: processed301.count,
    yellowItemsCount302: processed302.count,
    yellowItemsCount100: processed100.count,
    yellowItemsCount400: processed400.count,
    yellowItemsCount200: processed200.count,
    yellowItemsCountYellowTotal: processedTotal.count,

    // 五星物品详情
    yellowItems301: processed301.yellowItems,
    yellowItems302: processed302.yellowItems,
    yellowItems100: processed100.yellowItems,
    yellowItems400: processed400.yellowItems,
    yellowItems200: processed200.yellowItems,
    yellowItemsYellowTotal: processedTotal.yellowItems,

    // 间隔抽数
    intervals301: processed301.intervals,
    intervals302: processed302.intervals,
    intervals100: processed100.intervals,
    intervals400: processed400.intervals,
    intervals200: processed200.intervals,
    intervalsYellowTotal: processedTotal.intervals,

    // 垫抽数
    postYellowCount301: processed301.postYellowCount,
    postYellowCount302: processed302.postYellowCount,
    postYellowCount100: processed100.postYellowCount,
    postYellowCount400: processed400.postYellowCount,
    postYellowCount200: processed200.postYellowCount,
    postYellowCountYellowTotal: processedTotal.postYellowCount,

    // 统计数据
    resultstoday: todayCount,
    resultsgachacount: totalCount,
  };
}

export default {
  checkUserExists,
  getUserInfo,
  getGachaStats,
};