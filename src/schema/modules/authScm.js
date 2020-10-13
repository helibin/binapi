/*
 * @Author: helibin@139.com
 * @Date: 2019-10-22 17:42:03
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-03-02 16:38:08
 */
import Base from '../base'

module.exports = Base.createScm('tb_main_auth', 'auth认证表', {
  user_id: Base.commonFields.user_id,

  auth_info: Base.fieldDefine('JSON', null, {}),
  identifier: Base.fieldDefine('STRING', 128, '用户标识'),
  type: Base.commonFields.type,
  unique_id: Base.fieldDefine('STRING', 128, '第三方接入ID'),
  from: Base.fieldDefine('STRING', 10, '注册来源', 'wechat.mp'),
})
