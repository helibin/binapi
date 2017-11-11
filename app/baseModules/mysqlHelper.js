'use strict'

/** 内建模块 */

/** 第三方模块 */
import Sequelize from 'sequelize'

/** 基础模块 */
import CONFIG from 'config'
import t from './tools'
import logger from './logger'

/** 项目模块 */

const whosDB = CONFIG.db.who || 'none'
const dbConfig = CONFIG.db.mysql[whosDB] || CONFIG.db.mysql || {}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'mysql',

  pool: {
    max: dbConfig.connectionLimit,
    min: 0,
    idle: 10000
  }
})

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
  console.error(dbConfig, 'dbConfig...')
})

const MySQLHelper = async (ctx) => {
  this.sequelize = sequelize,
  this.ctx = ctx
}
