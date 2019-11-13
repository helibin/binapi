/*
 * @Author: helibin@139.com
 * @Date: 2018-09-29 21:58:36
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-04 09:56:38
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_user', '用户信息表', {
  address: Base.fieldDefine('STRING', 256, '家庭住址'),
  birthday: Base.fieldDefine('DATE', null, '出生时间戳'),
  email: Base.commonFields.email,
  file_path: Base.commonFields.file_path,
  height: Base.fieldDefine('FLOAT', '5, 2', '身高, cm'),
  last_seen_at: Base.fieldDefine('DATE', null, '最后访问时间戳'),
  last_sign_at: Base.fieldDefine('DATE', null, '最后登录时间戳'),
  phone: Base.commonFields.phone,
  name: Base.commonFields.name,
  nickname: Base.commonFields.nickname,
  other_info: Base.fieldDefine('JSON', null, '其他信息', {}),
  password: Base.fieldDefine('CHAR', 40, '密码'),
  gender: Base.commonFields.gender,
  sign_way: Base.fieldDefine('STRING', 10, '认证方式'),
  weight: Base.fieldDefine('FLOAT', '5, 2', '体重, kg'),

  extra_info: Base.commonFields.extra_info,
})
