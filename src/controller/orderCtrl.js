/*
 * @Author: helibin@139.com
 * @Date: 2018-10-09 10:27:08
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-01-19 08:55:27
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'

module.exports = new (class extends Base {
  async recharge(ctx) {
    const ret = this.t.initRet()
    const { goods_id, pay_way = 'wechat', pay_from = 'mp' } = ctx.request.body

    let newData = {
      type: 'userRecharge',
      goods_id,
      pay_from,
      pay_way,
    }

    // 查找产品
    const goodsCheck = await Mod.goodsMod.get(ctx, {
      id: goods_id,
      start_at: { $or: { $lte: Date.now(), $is: null } },
      end_at: { $or: { $gte: Date.now(), $is: null } },
    })
    if (this.t.isEmpty(goodsCheck)) throw new this.ce('noSuchResource', 'noSuchGoods', { goods_id })

    // 充值订单
    const { relief_type, price, relief, amount } = goodsCheck
    let orderPrice = price || 0
    let orderAmount = amount || 1
    if (['discount', 'present'].includes(goodsCheck.relief_type)) {
      if (relief_type === 'discount') orderPrice = this.t.compute(`${orderPrice} * ${relief}`, 2)
      if (relief_type === 'present') orderAmount = this.t.compute(`${orderAmount} + ${relief}`, 2)
    }

    newData.goods_info = goodsCheck
    newData.price = orderPrice < 0.01 ? 0.01 : orderPrice // 最小支付金额为0.01元
    newData.amount = orderAmount < 1 ? 1 : orderAmount // 最小数量为1
    newData.relief = goodsCheck.relief
    newData.relief_type = goodsCheck.relief_type
    newData.open_id = ctx.state.user[newData.pay_way].open_id
    newData.phone = ctx.state.user.phone
    newData.user_id = ctx.state.userId
    newData.card_id = ctx.state.user.card_id

    ret.data = await Mod.orderMod.run(ctx, 'addDataByPay', newData)

    ctx.state.logger('debug', `生成充值订单: id=${ret.data.new_id}`, newData)
    ctx.state.sendJSON(ret)
  }

  async cardRecharge(ctx) {
    const ret = this.t.initRet()
    const { goods_id, card_no, pay_way = 'wechat', pay_from = 'mp' } = ctx.request.body

    let newData = {
      type: 'cardRecharge',
      goods_id,
      pay_from,
      pay_way,
    }

    const cardCheck = await Mod.cardMod.run(ctx, 'getData', { code: card_no.toUpperCase() })
    if (this.t.isEmpty(cardCheck)) throw new this.ce('noSuchResource', 'noSuchCard', { card_no })

    // 查找产品
    const goodsCheck = await Mod.goodsMod.get(ctx, {
      id: goods_id,
      start_at: { $or: { $lte: Date.now(), $is: null } },
      end_at: { $or: { $gte: Date.now(), $is: null } },
    })
    if (this.t.isEmpty(goodsCheck)) throw new this.ce('noSuchResource', 'noSuchGoods', { goods_id })

    // 充值订单
    const { relief_type, price, relief, amount } = goodsCheck
    let orderPrice = price || 0
    let orderAmount = amount || 1
    if (['discount', 'present'].includes(goodsCheck.relief_type)) {
      if (relief_type === 'discount') orderPrice = this.t.compute(`${orderPrice} * ${relief}`, 2)
      if (relief_type === 'present') orderAmount = this.t.compute(`${orderAmount} + ${relief}`, 2)
    }

    newData.goods_info = goodsCheck
    newData.price = orderPrice < 0.01 ? 0.01 : orderPrice // 最小支付金额为0.01元
    newData.amount = orderAmount < 1 ? 1 : orderAmount // 最小数量为1
    newData.relief = goodsCheck.relief
    newData.relief_type = goodsCheck.relief_type
    newData.open_id = ctx.state.user[newData.pay_way].open_id
    newData.phone = cardCheck.phone
    newData.user_id = cardCheck.user_id
    newData.card_id = cardCheck.id

    ret.data = await Mod.orderMod.run(ctx, 'addDataByPay', newData)

    ctx.state.logger('debug', `生成卡片充值订单: id=${ret.data.new_id}`, newData)
    ctx.state.sendJSON(ret)
  }

  async charging(ctx) {
    const ret = this.t.initRet()
    const {
      device_id,
      port,
      amount,
      pay_way = 'balance',
      battery_type = 'lithium',
      charging_ratio = '90',
      pay_from = 'mp',
    } = ctx.request.body

    // 设备状态校验
    const deviceCheck = await Mod.deviceMod.get(ctx, device_id, {
      attributes: { exclude: ['key', 'secret', 'iot_info'] },
    })
    if (this.t.isEmpty(deviceCheck)) throw new this.ce('noSuchResource', 'deviceNotExist', { device_id })
    if (deviceCheck.is_disabled || deviceCheck.status !== 'online') throw new this.ce('deviceDisabled')

    // 当前充电订单检测
    const orderCheck = await Mod.orderMod.get(ctx, {
      user_id: ctx.state.userId,
      status: 'charging',
      // port,
    })
    if (!this.t.isEmpty(orderCheck)) throw new this.ce('chargingOrderExist', { order_id: orderCheck.id })

    const newData = {
      card_id: ctx.state.user.card_id,
      device_id: deviceCheck.id,
      group_id: deviceCheck.group_id,
      user_id: ctx.state.userId,
      amount,
      battery_type,
      charging_ratio,
      device_code: deviceCheck.code,
      device_info: deviceCheck,
      pay_at: Date.now(),
      pay_from,
      pay_status: 'success',
      pay_way,
      phone: ctx.state.user.phone,
      port,
      price: 0,
      type: 'eBikeCharging',
      status: 'charging',
      stop_type: 'wait',
    }
    // 订单金额计算
    if (amount > 0) {
      const chargingAmount = parseInt(amount / deviceCheck.price_time) + ((amount % deviceCheck.price_time > 0) | 0)
      newData.price = this.t.compute(`${deviceCheck.price} * ${chargingAmount}`, 2)
    }

    if (['balance', 'card'].includes(pay_way)) {
      ret.data = await Mod.orderMod.run(ctx, 'addChargingData', newData)
    } else {
      ret.data = await Mod.orderMod.run(ctx, 'addDataByPay', newData)
    }

    ctx.state.logger('debug', `生成充电订单: id=${ret.data.new_id}, JackOn=${ret.data.order_no}`)
    ctx.state.sendJSON(ret)
  }

  async close(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    await Mod.orderMod.run(ctx, 'close', targetId)

    ctx.state.logger(null, `关闭订单, orderId=${targetId}`)
    ctx.state.sendJSON(ret)
  }
})()
