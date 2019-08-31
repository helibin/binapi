/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-09-15 15:54:20
 */
/** 内建模块 */

/** 第三方模块 */
import Sequelize from 'sequelize';

/** 基础模块 */
import CONFIG from 'config';
import { sqlLog, logger } from './logger';

/** 项目模块 */


const dbConfig = CONFIG.dbServer.mysql || {};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host   : dbConfig.host,
  port   : dbConfig.port,
  dialect: 'mysql',
  logging: CONFIG.env !== 'production' ? sqlLog : false,

  define: {
    freezeTableName: true,
    timestamps     : true,
    underscored    : true,
    createdAt      : false,
    updatedAt      : false,
    deletedAt      : false,
  },
  pool: {
    min : 0,
    max : dbConfig.connectionLimit,
    idle: 10000,
  },

  // 在打印执行的SQL日志时输出执行时间（毫秒）
  benchmark: true,
});

// 测试db连接
sequelize.authenticate().then(() => {
  logger('debug', 'Mysql连接成功！');
}).catch((err) => {
  logger(err, '无法连接至Mysql数据库：', err);
});

export {
  sequelize,
  Sequelize,
};
