/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 11:55:42
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { Sequelize, sequelize } from '../helper/mysqlHelper';


export const Template = sequelize.define('tb_main_templates', {
  seq: {
    type         : Sequelize.BIGINT,
    primaryKey   : true,
    autoIncrement: true,
  },
  id: {
    type     : Sequelize.CHAR(65),
    allowNull: false,
  },
  name: {
    type   : Sequelize.STRING,
    comment: '名称',
  },
  path: {
    type   : Sequelize.STRING,
    comment: '路径',
  },
  is_disabled: {
    type    : Sequelize.STRING,
    validate: { isIn: [[0, 1]] },
    comment : '是否禁用',
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
}, { comment: '网站模板表' });

Template.sync();

export default Template;
