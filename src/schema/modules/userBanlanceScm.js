/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-05 11:09:49
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_user_balance', '用户流水表', {
  user_id: Base.commonFields.user_id,

  pay: Base.fieldDefine('DECIMAL', '14, 2', '支付数量'),
  pay_info: Base.fieldDefine('JSON', null, '支付信息', {}),
  pay_type: Base.fieldDefine('STRING', 10, '支付类型'),
  recharge: Base.fieldDefine('DECIMAL', '14, 2', '充值数量'),
  recharge_from: Base.fieldDefine('STRING', 10, '充值来源'),
  recharge_info: Base.fieldDefine('JSON', null, '充值信息', {}),
  recharge_type: Base.fieldDefine('STRING', 10, '充值类型'),
  total: Base.fieldDefine('DECIMAL', '14, 2', '余额'),
})
