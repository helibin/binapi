/*
 * @Author: helibin@139.com
 * @Date: 2018-10-09 10:27:08
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 23:47:01
 */
/** 内建模块 */

/** 第三方模块 */
import dayjs from 'dayjs'

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'

module.exports = new (class extends Base {
  async watch(ctx) {
    const ret = this.t.initRet()
    const { code } = ctx.query

    const fundRes = await Mod.fundMod.get(ctx, { code })
    if (this.t.isEmpty(fundRes)) throw new this.ce('noSuchResource', 'fundNotExits')

    // 获取股票数据
    const { data } = await ctx.state.axios.get(fundRes.api)
    const newStockDataList = []
    const stockList = []
    for (let d of data.stock) {
      newStockDataList.push({
        id: this.t.genUUID(),
        fund_id: fundRes.id,
        fund_code: code,
        name: d.zcName,
        code: d.zcCode,
        cc_rate: d.ccRate,
        end_date: d.enddate,
        hold: d.hold,
        price: d.price,
        total: d.totalPrice,
        extra_info: d,
      })
      stockList.push(d.zcCode)
    }
    await Mod.stockMod.run(ctx, 'batchAdd', newStockDataList)
    if (fundRes.stocks && stockList.sort().toString() !== fundRes.stocks.toString()) {
      await ctx.state.wxWork.send(
        'fundStockChanged',
        this.CONFIG.wxWorkServer.webhook.noticeList,
        `${fundRes.name}(${fundRes.code})`,
      )
    }
    await Mod.fundMod.modify(
      ctx,
      { code },
      {
        stocks: stockList,
        stock_info: {
          ...fundRes.stock_info,
          [dayjs().format('YYYYMMDD')]: stockList,
        },
      },
    )

    ctx.state.sendJSON(ret)
  }
})()
