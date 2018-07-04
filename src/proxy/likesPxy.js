/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import mysql from '../helpers/mysqlHelper';

export const Like = mysql.sequelize.define('tb_main_likes', {
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
  logoURL: {
    type   : mysql.Sequelize.TEXT,
    comment: 'logo',
  },
  appName: {
    type   : mysql.Sequelize.STRING,
    comment: '来自app名称',
  },
  createdAt: {
    type     : mysql.Sequelize.BIGINT,
    allowNull: false,
    comment  : '创建时间戳',
  },
  updatedAt: {
    type     : mysql.Sequelize.BIGINT,
    allowNull: false,
    comment  : '更新时间戳',
  },
}, { comment: '点赞表' });

Like.sync();

export default Like;
