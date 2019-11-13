/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-06 11:31:54
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_order', '订单表', {
  device_id: Base.commonFields.device_id,
  group_id: Base.fieldDefine('CHAR', 32, '所属设备组ID'),
  user_id: Base.commonFields.user_id,

  amount: Base.fieldDefine('INTEGER', 6, '数量, 秒'),
  battery_type: Base.fieldDefine('STRING', 10, '电池类型'),
  charging_ratio: Base.fieldDefine('STRING', 10, '充电电量'),
  device_info: Base.fieldDefine('JSON', null, '设备信息', {}),
  end_at: Base.fieldDefine('DATE', 3, '结束时间'),
  from: Base.fieldDefine('STRING', 10, '订单来源'),
  group_info: Base.fieldDefine('JSON', null, '设备组信息', {}),
  order_no: Base.fieldDefine('STRING', 20, '订单号'),
  price: Base.commonFields.price,
  pay_status: Base.fieldDefine('STRING', 10, '支付状态'),
  pay_way: Base.fieldDefine('STRING', 10, '付款方式'),
  phone: Base.commonFields.phone,
  port: Base.fieldDefine('INTEGER', 2, '端口'),
  power: Base.fieldDefine('FLOAT', '8, 4', '用电量, kw.h'),
  relief: Base.fieldDefine('DECIMAL', '5, 2', '减免'),
  remark: Base.commonFields.remark,
  status: Base.fieldDefine('STRING', 10, '订单状态'),
  stop_type: Base.fieldDefine('STRING', 10, '结束方式'),
  type: Base.commonFields.type,

  extra_info: Base.commonFields.extra_info,
})
