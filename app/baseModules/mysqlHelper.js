'use strict'

/** 内建模块 */

/** 第三方模块 */
import Sequelize from 'sequelize'

/** 基础模块 */
import CONFIG from 'config'
import * as t from './tools'

/** 项目模块 */

const dbConfig = CONFIG.dbServer.mysql || {}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'mysql',
  logging: CONFIG.env == 'product' ? false : console.log,

  define: {
    freezeTableName: true,
    timestamps: false,
  },
  pool: {
    max: dbConfig.connectionLimit,
    min: 0,
    idle: 10000
  }
})

// 测试db连接
sequelize.authenticate().then(() => {
  console.log('连接成功！');
})
.catch(err => {
  console.error('无法连接至数据库：', err);
});

export default {
  sequelize,
  Sequelize
}
