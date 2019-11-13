/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 11:40:23
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { Sequelize, sequelize } from '../helper/mysqlHelper';

export const Auth = sequelize.define('tb_main_auth', {
  seq: {
    type         : Sequelize.BIGINT,
    primaryKey   : true,
    autoIncrement: true,
  },
  user_id: {
    type     : Sequelize.CHAR(65),
    allowNull: false,
    comment  : '用户ID',
    unique   : true,
  },
  identifier: {
    type     : Sequelize.STRING,
    allowNull: false,
    comment  : '用户标识',
  },
  password: {
    type   : Sequelize.STRING,
    comment: '密码',
  },
  unique_id: {
    type   : Sequelize.STRING,
    comment: '第三方接入ID',
  },
  created_at: {
    type        : Sequelize.DATE(3),
    defaultValue: Sequelize.NOW,
    allowNull   : false,
    comment     : '创建时间戳',
  },
  updated_at: {
    type        : Sequelize.DATE(3),
    allowNull   : false,
    defaultValue: Sequelize.NOW,
    comment     : '更新时间戳',
  },
}, { comment: 'auth认证表' });

export default Auth;
