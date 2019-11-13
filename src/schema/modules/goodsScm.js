/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 21:23:35
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_goods', '商品表', {
  name: Base.commonFields.name,
  price: Base.commonFields.price,
  relief: Base.fieldDefine('DECIMAL', '5, 2', '优惠力度(百分比|数额)'),
  relief_type: Base.fieldDefine('STRING', 10, '优惠类型'),
  time_start: Base.fieldDefine('DATE', 3, '上架时间'),
  time_end: Base.fieldDefine('DATE', 3, '下架时间'),
})
