/*
 * @Author: helibin@139.com
 * @Date: 2018-10-09 10:27:08
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-01-02 17:41:28
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'

module.exports = new (class extends Base {
  async add(ctx) {
    const ret = this.t.initRet()
    const { code } = ctx.request.body

    const fundRes = await ctx.state.axios.run('get', 'http://fund.10jqka.com.cn/data/client/myfund/' + code)
    const newData = {
      id: this.t.genUUID(),
      name: fundRes.data[0].name,
      code: fundRes.data[0].code,
      api: 'http://fund.10jqka.com.cn/web/fund/stockAndBond/' + code,
    }
    await Mod.fundMod.add(ctx, newData)
    ret.data = { new_id: newData.id }

    ctx.state.sendJSON(ret)
  }
})()
