/*
 * @Author: helibin@139.com
 * @Date: 2018-10-09 10:27:08
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-16 10:04:55
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

    let fundCodes = code.split(',')
    for (const d of fundCodes) {
      await this._watch(ctx, d).catch(ex => {
        ctx.state.logger(ex, `检测基金${d}出现异常: `, this.t.jsonStringify(ex))
      })
    }

    ctx.state.sendJSON(ret)
  }
  async _watch(ctx, code) {
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
      stockList.push(`${d.zcCode}(${d.zcName})`)
    }
    await Mod.stockMod.run(ctx, 'batchAdd', newStockDataList)
    if (fundRes.stocks && stockList.sort().toString() !== fundRes.stocks.toString()) {
      const subStocks = fundRes.stocks.filter(d => !stockList.includes(d)).toString()
      const addStocks = stockList.filter(d => !fundRes.stocks.includes(d)).toString()
      ctx.state.logger(null, `减持: ${subStocks}, 增持: ${addStocks}`)
      if (subStocks && addStocks) {
        await ctx.state.wxWork.send(
          'fundStockChanged',
          this.CONFIG.wxWorkServer.webhook.noticeList,
          `${fundRes.name}(${fundRes.code})`,
          `${subStocks ? `减持: ${subStocks}, ` : ''}${addStocks ? `增持: ${addStocks}, ` : ''}`,
        )
      }
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
  }
})()
