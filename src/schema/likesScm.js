/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 10:41:44
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { Sequelize, sequelize } from '../helper/mysqlHelper';

export const Like = sequelize.define('tb_main_likes', {
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
  logo_url: {
    type   : Sequelize.TEXT,
    comment: 'logo',
  },
  app_name: {
    type   : Sequelize.STRING,
    comment: '来自app名称',
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
}, { comment: '点赞表' });

export default Like;
