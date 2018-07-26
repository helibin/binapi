/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 11:56:02
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { Sequelize, sequelize } from '../helper/mysqlHelper';


export const User = sequelize.define('tb_main_users', {
  seq: {
    type         : Sequelize.BIGINT,
    primaryKey   : true,
    autoIncrement: true,
  },
  id: {
    type     : Sequelize.CHAR(65),
    allowNull: false,
  },
  nickname: {
    type   : Sequelize.STRING,
    comment: '昵称',
  },
  name: {
    type   : Sequelize.STRING,
    comment: '姓名',
  },
  phone: {
    type   : Sequelize.STRING,
    comment: '电话',
  },
  email: {
    type    : Sequelize.STRING,
    validate: { isEmail: true },
    comment : '邮箱',
  },
  extra_info: {
    type   : Sequelize.JSON,
    comment: '额外信息',
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
}, { comment: '用户信息表' });

User.sync();

export default User;
