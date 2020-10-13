/*
 * @Author: helibin@139.com
 * @Date: 2018-10-09 10:27:08
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-16 18:27:06
 */
/** 内建模块 */

/** 第三方模块 */
import dayjs from 'dayjs'

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'
import Ctrl from '.'

module.exports = new (class extends Base {
  async deviceStatusNotify(ctx, targetId, text) {
    return await Ctrl.wechatCtrl.send(ctx, targetId, this.CONFIG.wechatServer.messageTemplate.parkingPay, {
      car_number1: {
        value: '粤A12345',
      },
      thing3: {
        value: dayjs().format('YYYY年MM月DD日 HH:mm:ss'),
      },
      amount4: {
        value: 9999,
      },
      thing5: {
        value: text || '长期订阅消息测试',
      },
    })
  }
})()
