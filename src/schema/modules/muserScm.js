/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:44
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-06 09:17:15
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_muser', '后台用户信息表', {
  muser_id: Base.commonFields.muser_id,

  address: Base.commonFields.address,
  bank_name: Base.fieldDefine('STRING', 20, '开户银行'),
  bank_username: Base.fieldDefine('STRING', 20, '开户名'),
  bank_branch: Base.fieldDefine('STRING', 50, '开户支行'),
  bank_account: Base.fieldDefine('STRING', 50, '开户账号'),
  commission_type: Base.fieldDefine('STRING', 5, '分佣模式'),
  commission_ratio: Base.fieldDefine('FLOAT', '5, 2', '分佣比例'),
  company_name: Base.fieldDefine('STRING', 20, '公司名称'),
  contract_start: Base.fieldDefine('DATE', 3, '合同开始时间戳'),
  contract_end: Base.fieldDefine('DATE', 3, '合同截止时间戳'),
  contract_no: Base.fieldDefine('STRING', 20, '合同编号'),
  contract_paths: Base.fieldDefine('JSON', null, '合同文件路径集合', []),
  email: Base.commonFields.email,
  gender: Base.commonFields.gender,
  identifier: Base.fieldDefine('STRING', 128, '用户标识'),
  last_seen_at: Base.fieldDefine('DATE', 3, '最后访问时间戳'),
  last_sign_at: Base.fieldDefine('DATE', 3, '最后登录时间戳'),
  name: Base.commonFields.name,
  password: Base.fieldDefine('CHAR', 40, '密码'),
  phone: Base.commonFields.phone,
  privileges: Base.fieldDefine('TEXT', null, '权限列表'),
  type: Base.commonFields.type,

  extra_info: Base.commonFields.extra_info,
})
