'use strict'

/** 内建模块 */

/** 第三方模块 */
import Sequelize from 'sequelize'

/** 基础模块 */
import CONFIG from 'config'
import t from './tools'
import logger from './logger'

/** 项目模块 */

const dbTypeKey = 'mysql'
const dbConfigKey = CONFIG.db.config
const DBConfig = CONFIG[dbTypeKey][dbConfigKey]

const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, {
  host: DBConfig.host,
  dialect: dbTypeKey,

  pool: {
    max: DBConfig.connectionLimit,
    min: 0,
    idle: 10000
  }
})

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
