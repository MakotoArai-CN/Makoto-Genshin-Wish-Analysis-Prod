/**
 * 数据库服务模块
 * @module services/database
 */

import { MongoClient } from 'mongodb';
import { mongoConfig } from '../config.js';

let client = null;
let db = null;
let isConnected = false;

/**
 * 初始化数据库连接
 * @returns {Promise<void>}
 */
export async function initDatabase() {
  if (client && isConnected) {
    return;
  }

  try {
    client = new MongoClient(mongoConfig.url, {
      ...mongoConfig.options,
      serverSelectionTimeoutMS: 5000, // 5秒超时
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    db = client.db(mongoConfig.dbName);
    
    // 测试连接
    await db.command({ ping: 1 });
    isConnected = true;
  } catch (error) {
    client = null;
    db = null;
    isConnected = false;
    throw error;
  }
}

/**
 * 检查数据库是否已连接
 * @returns {boolean}
 */
export function isDatabaseConnected() {
  return isConnected && client !== null && db !== null;
}

/**
 * 获取数据库实例
 * @returns {import('mongodb').Db}
 * @throws {Error} 如果数据库未连接
 */
export function getDatabase() {
  if (!isDatabaseConnected()) {
    throw new Error('Database not connected');
  }
  return db;
}

/**
 * 获取集合
 * @param {string} name - 集合名称
 * @returns {import('mongodb').Collection}
 * @throws {Error} 如果数据库未连接
 */
export function getCollection(name) {
  if (!isDatabaseConnected()) {
    throw new Error('Database not connected');
  }
  return db.collection(name);
}

/**
 * 安全获取集合（返回 null 如果未连接）
 * @param {string} name - 集合名称
 * @returns {import('mongodb').Collection|null}
 */
export function getCollectionSafe(name) {
  if (!isDatabaseConnected()) {
    return null;
  }
  return db.collection(name);
}

/**
 * 关闭数据库连接
 * @returns {Promise<void>}
 */
export async function closeDatabase() {
  if (client) {
    try {
      await client.close();
    } catch (error) {
      console.error('Error closing database connection:', error);
    } finally {
      client = null;
      db = null;
      isConnected = false;
    }
  }
}

/**
 * 重试连接数据库
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试间隔（毫秒）
 * @returns {Promise<boolean>}
 */
export async function retryConnection(maxRetries = 3, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await initDatabase();
      return true;
    } catch (error) {
      console.warn(`Database connection attempt ${i + 1}/${maxRetries} failed`);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

export default {
  initDatabase,
  isDatabaseConnected,
  getDatabase,
  getCollection,
  getCollectionSafe,
  closeDatabase,
  retryConnection,
};