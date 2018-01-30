'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import mysql from '../baseModules/mysqlHelper'

export const Auth = mysql.sequelize.define('tb_main_auth', {
  seq: {
    type: mysql.Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: mysql.Sequelize.CHAR(65),
    allowNull: false,
    comment: '用户ID',
    unique: true,
  },
  identifier: {
    type: mysql.Sequelize.STRING,
    allowNull: false,
    comment: "用户标识",
  },
  passwordHash: {
    type: mysql.Sequelize.STRING,
    comment: "密码",
  },
  uniqueId: {
    type: mysql.Sequelize.STRING,
    comment: "第三方接入ID",
  },
  createdAt: {
    type: mysql.Sequelize.BIGINT,
    allowNull: false,
    comment: "创建时间戳",
  },
  updatedAt: {
    type: mysql.Sequelize.BIGINT,
    allowNull: false,
    comment: "更新时间戳",
  },
}, {
  comment: 'auth认证表'
})

Auth.sync()

export default Auth