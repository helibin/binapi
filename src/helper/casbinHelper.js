/*
 * @Author: helibin@139.com
 * @Date: 2019-12-11 09:56:28
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-12-27 17:59:08
 */
/** 内建模块 */
import path from 'path'

/** 第三方模块 */
import * as casbin from 'casbin'
import { SequelizeAdapter } from 'casbin-sequelize-adapter'

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import { logger, sqlLog } from './logger'

const dbConfig = CONFIG.dbServer.mysql || {}
try {
  SequelizeAdapter.newAdapter({
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    dialect: 'mysql',
    logging: ['prod', 'qa'].includes(process.env.NODE_ENV) ? false : sqlLog,
    benchmark: true,
  }).then(async adapter => {
    exports.ef = await casbin.newEnforcer(path.join(__dirname, '../data/casbin_model.conf'), adapter)

    logger('debug', 'casbin初始化成功')
  })
} catch (ex) {
  logger(err, 'casbin初始化失败: ', err)
}

exports.casbin = casbin
