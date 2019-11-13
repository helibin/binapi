/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 21:09:26
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_device', '设备表', {
  group_id: Base.fieldDefine('CHAR', 32, '所属设备组ID'),

  key: Base.fieldDefine('STRING', 40, 'ProductKey'),
  secret: Base.fieldDefine('STRING', 40, 'DeviceSecret'),
  auto_stop: Base.fieldDefine('BOOLEAN', null, '是否充满自停'),
  charing_type: Base.fieldDefine('STRING', 10, '充电类型'),
  code: Base.commonFields.code,
  port_info: Base.fieldDefine('STRING', 10, '插口信息'),
  extra_info: Base.commonFields.extra_info,
  iot_info: Base.fieldDefine('JSON', null, 'iot信息', {}),
  iot_status: Base.fieldDefine('JSON', null, 'iot状态', {}),
  lat: Base.fieldDefine('STRING', '64', '纬度'),
  lng: Base.fieldDefine('STRING', '64', '经度'),
  max_power: Base.fieldDefine('INTEGER', 4, '最大功率, 瓦'),
  name: Base.fieldDefine('STRING', 30, '设备名'),
  open: Base.fieldDefine('BOOLEAN', null, '是否对外开放', true),
  port: Base.fieldDefine('INTEGER', 2, '插口数量'),
  port_choice: Base.fieldDefine('BOOLEAN', null, '插口自选', true),
  range: Base.fieldDefine('STRING', 128, '适用范围'),
  remark: Base.commonFields.remark,
  status: Base.fieldDefine('STRING', 10, '状态'),
  work_start: Base.fieldDefine('STRING', 5, '开始营业时间, 24h'),
  work_end: Base.fieldDefine('STRING', 5, '结束营业时间, 24h'),
  type: Base.commonFields.type,
})
