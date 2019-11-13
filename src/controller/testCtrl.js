/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-12 21:12:35
 */
/** 内建模块 */

/** 第三方模块 */
// import casbin from 'casbin'

/** 基础模块 */
import Base from './base'

/** 项目模块 */

module.exports = new (class extends Base {
  async test(ctx) {
    const ret = this.t.initRet()

    // const enforcer = await casbin.newEnforcer('path/to/model.conf', 'path/to/policy.csv')

    // 接收消息
    ret.data = await ctx.state.alyMns.run('recvP')
    // 删除消息
    // ret.data = ctx.state.alyMns.run('deleteP', 'res.Message.ReceiptHandle')

    // 给设备发送消息
    // ret.data = await ctx.state.alyPop.http('iot', 'Pub', {
    //   TopicFullName: '/a1dKj7BO7bg/X019045890001/user/rgetpare',
    //   MessageContent: this.t.getBase64('{"JackOn":001230AA07800100,"MsID":F3C39D5B}'),
    //   ProductKey: 'a1dKj7BO7bg',
    // })

    ctx.state.sendJSON(ret)
  }

  async getSTSToken(ctx) {
    const stsToken = await ctx.state.alyOss.getSTSUploadToken('test', 60 * 60)
    ctx.state.sendJSON(
      this.t.initRet({
        sts_token: stsToken,
      }),
    )
  }
})()
