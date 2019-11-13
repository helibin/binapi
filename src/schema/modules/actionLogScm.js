/*
 * @Author: helibin@139.com
 * @Date: 2019-10-23 20:46:32
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-01 10:54:27
 */

import Base from '../base'

module.exports = Base.createScm('tb_main_action_log', '操作日志表', {
  muser_id: Base.commonFields.muser_id,

  action: Base.fieldDefine('STRING', 20, '动作'),
  api: Base.fieldDefine('STRING', 256, '接口地址'),
  content: Base.commonFields.content,
  extra_info: Base.commonFields.extra_info,
  type: Base.commonFields.type,
})
