/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-28 17:43:20
 */
/** 内建模块 */

/** 第三方模块 */
import Sequelize from 'sequelize'

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import Log from './logger'

// 条件别名
const Op = Sequelize.Op
const operatorsAliases = {
  $eq: Op.eq, // =
  $ne: Op.ne, // !=
  $gte: Op.gte, // >=
  $gt: Op.gt, // >
  $lte: Op.lte, // <=
  $lt: Op.lt, // <
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col,
}

const dbConfig = CONFIG.dbServer.mysql || {}
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'mysql',
  logging: ['prod', 'qa'].includes(process.env.NODE_ENV) ? false : Log.sqlLog,

  define: {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    createdAt: false,
    updatedAt: 'updated_at',
    deletedAt: false,
  },
  pool: {
    min: 0,
    max: dbConfig.connectionLimit,
    idle: 10000,
  },

  // 在打印执行的SQL日志时输出执行时间（毫秒）
  benchmark: true,

  operatorsAliases,
})

// 测试db连接
sequelize
  .authenticate()
  .then(() => {
    Log.logger('debug', 'Mysql连接成功！')
  })
  .catch(err => {
    Log.logger(err, '无法连接至Mysql数据库：', err)
  })

exports.sequelize = sequelize
exports.Sequelize = Sequelize

// https://sequelize.org/v4/
