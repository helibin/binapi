/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-01 14:16:35
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_sys_menu', '系统菜单表', {
  menu_pid: Base.fieldDefine('CHAR', 32, '所属菜单ID'),

  directory: Base.fieldDefine('STRING', 128, '目录'),
  name: Base.commonFields.name,
  icon: Base.fieldDefine('STRING', 128, '图标'),
  order: Base.commonFields.order,
  remark: Base.commonFields.remark,
  route: Base.fieldDefine('TEXT', null, '路由'),
})
