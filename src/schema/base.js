/*
 * @Author: helibin@139.com
 * @Date: 2018-10-10 10:37:59
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-05 11:08:58
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { CONFIG, YamlCC, Mysql } from '../helper'

/** 项目模块 */

const fieldDefine = (type, length, comment, defaultValue, ...args) => ({
  type: length ? Mysql.Sequelize[type.toUpperCase()](length) : Mysql.Sequelize[type.toUpperCase()],
  comment,
  defaultValue,
  ...args,
})

const createScm = (tableName, tableComment, fields) =>
  Mysql.sequelize.define(
    tableName,
    Object.assign(
      {
        seq: fieldDefine('BIGINT'),
        id: {
          type: Mysql.Sequelize.CHAR(32),
          primaryKey: true,
          allowNull: false,
        },
        creator_id: fieldDefine('CHAR', 32, '创建者ID'),
        editor_id: fieldDefine('CHAR', 32, '编辑者ID'),
      },
      fields,
      {
        is_disabled: fieldDefine('BOOLEAN', null, '是否已禁用', false),
        created_at: fieldDefine('DATE', null, '创建时间戳', Mysql.Sequelize.NOW(3)),
        updated_at: fieldDefine('DATE', null, '更新时间戳', Mysql.Sequelize.NOW(3)),
      },
    ),
    { comment: tableComment },
  )

const commonFields = {
  device_id: fieldDefine('CHAR', 32, '所属设备ID'),
  muser_id: fieldDefine('CHAR', 32, '所属后台用户ID'),
  order_id: fieldDefine('CHAR', 32, '所属订单ID'),
  user_id: fieldDefine('CHAR', 32, '所属用户ID'),

  address: fieldDefine('STRING', 256, '地址'),
  brief: fieldDefine('STRING', 256, '简介'),
  code: fieldDefine('STRING', 64, '代码'),
  content: fieldDefine('TEXT', null, '内容'),
  email: fieldDefine('STRING', 128, '邮箱'),
  extra_info: fieldDefine('JSON', null, '额外信息', {}),
  file_path: fieldDefine('TEXT', null, '文件路径'),
  file_paths: fieldDefine('JSON', null, '文件路径集合', []),
  file_url: fieldDefine('TEXT', null, '文件链接'),
  gender: fieldDefine('TINYINT', null, '性别', 0),
  intro: fieldDefine('TEXT', null, '介绍'),
  phone: fieldDefine('STRING', 20, '手机'),
  name: fieldDefine('STRING', 128, '名字'),
  nickname: fieldDefine('STRING', 128, '昵称'),
  price: fieldDefine('DECIMAL', '10, 2', '价格', 0),
  ratio: fieldDefine('DECIMAL', '5, 2', '比例'),
  remark: fieldDefine('TEXT', null, '备注'),
  order: fieldDefine('INTEGER', 3, '顺序', 0),
  tel: fieldDefine('STRING', 20, '座机'),
  title: fieldDefine('STRING', 128, '标题'),
  type: fieldDefine('STRING', 20, '类型'),
}

export default {
  CONFIG,
  CONST: YamlCC.CONST,
  Sequelize: Mysql.Sequelize,
  commonFields,
  createScm,
  fieldDefine,
  sequelize: Mysql.sequelize,
}
// https://sequelize.org/v4/manual/tutorial/models-definition.html#data-types
