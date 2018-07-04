/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import mysql from '../helpers/mysqlHelper';


export const Template = mysql.sequelize.define('tb_main_templates', {
  seq: {
    type         : mysql.Sequelize.BIGINT,
    primaryKey   : true,
    autoIncrement: true,
  },
  id: {
    type     : mysql.Sequelize.CHAR(65),
    allowNull: false,
  },
  name: {
    type   : mysql.Sequelize.STRING,
    comment: '名称',
  },
  path: {
    type   : mysql.Sequelize.STRING,
    comment: '路径',
  },
  isDisabled: {
    type    : mysql.Sequelize.STRING,
    validate: { isIn: [[0, 1]] },
    comment : '是否禁用',
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
}, { comment: '网站模板表' });

Template.sync();

export default Template;
