/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 21:40:44
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_stock', '股票表', {
  fund_id: Base.fieldDefine('CHAR', 32, '所属基金ID'),

  name: Base.commonFields.name,
  code: Base.commonFields.code,
  cc_rate: Base.fieldDefine('FLOAT', '5, 2', '资产占比'),
  end_date: Base.fieldDefine('STRING', 10, '截止时间'),
  hold: Base.fieldDefine('FLOAT', '8, 2', '持有'),
  price: Base.fieldDefine('FLOAT', '5, 2', '股价'),
  total: Base.commonFields.price,
  remark: Base.commonFields.remark,

  extra_info: Base.commonFields.extra_info,
})
