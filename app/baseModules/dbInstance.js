'use strict'

/** 内建模块 */

/** 第三方模块 */
import Sequelize from 'sequelize'

/** 基础模块 */
import CONFIG from 'config'
import * as t from './tools'

/** 项目模块 */
import mysqlHelper from './mysqlHelper'



export const User = mysqlHelper.sequelize.define('tb_main_users', {
  seq: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  id: {
    type: Sequelize.CHAR,
  },
  username: {
    type: Sequelize.STRING,
    comment: "用户名",
  }
})
