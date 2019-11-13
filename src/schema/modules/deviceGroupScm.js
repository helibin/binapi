/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 14:50:16
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_device_group', '设备分组表', {
  muser_id: Base.commonFields.muser_id,

  address: Base.commonFields.address,
  area_code: Base.fieldDefine('STRING', 20, '省市县代码, 如: 44,4403'),
  area_name: Base.fieldDefine('STRING', 20, '省市县名字, 如: 广东省,深圳市'),
  name: Base.fieldDefine('STRING', 30, '分组名'),
  price: Base.commonFields.price,
  price_type: Base.fieldDefine('STRING', 10, '收费类型'),
  price_time: Base.fieldDefine('INTEGER', 4, '计价时间, 分'),
  remark: Base.commonFields.remark,
  type: Base.commonFields.type,
})
