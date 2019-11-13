/*
 * @Author: helibin@139.com
 * @Date: 2019-10-22 17:42:03
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-01 10:47:18
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_auth', 'auth认证表', {
  user_id: Base.commonFields.user_id,

  identifier: Base.fieldDefine('STRING', 128, '用户标识'),
  type: Base.commonFields.type,
  unique_id: Base.fieldDefine('STRING', 128, '第三方接入ID'),
})
