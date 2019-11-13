/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 23:36:37
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_fund', '基金表', {
  name: Base.commonFields.name,
  code: Base.commonFields.code,
  api: Base.fieldDefine('STRING', 256, '接口地址'),
  stocks: Base.fieldDefine('JSON', null, '当前持有股票'),
  stock_info: Base.fieldDefine('JSON', null, '每日股票统计'),
  remark: Base.commonFields.remark,

  extra_info: Base.commonFields.extra_info,
})
