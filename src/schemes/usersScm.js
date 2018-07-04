/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import mysql from '../helpers/mysqlHelper';


export const User = mysql.sequelize.define('tb_main_users', {
  seq: {
    type         : mysql.Sequelize.BIGINT,
    primaryKey   : true,
    autoIncrement: true,
  },
  id: {
    type     : mysql.Sequelize.CHAR(65),
    allowNull: false,
  },
  nickname: {
    type   : mysql.Sequelize.STRING,
    comment: '昵称',
  },
  name: {
    type   : mysql.Sequelize.STRING,
    comment: '姓名',
  },
  phone: {
    type   : mysql.Sequelize.STRING,
    comment: '电话',
  },
  email: {
    type    : mysql.Sequelize.STRING,
    validate: { isEmail: true },
    comment : '邮箱',
  },
  extra_info: {
    type   : mysql.Sequelize.JSON,
    comment: '额外信息',
  },
  created_at: {
    type        : mysql.Sequelize.DATE(3),
    defaultValue: mysql.Sequelize.NOW,
    allowNull   : false,
    comment     : '创建时间戳',
  },
  updated_at: {
    type        : mysql.Sequelize.DATE(3),
    allowNull   : false,
    defaultValue: mysql.Sequelize.NOW,
    comment     : '更新时间戳',
  },
}, { comment: '用户信息表' });

User.sync();

export default User;
