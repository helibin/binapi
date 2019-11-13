/*
 * @Author: helibin@139.com
 * @Date: 2018-08-22 16:02:43
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-07-18 15:21:47
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { T } from '../helper'

/** 项目模块 */

export default new (class {
  constructor() {
    this.t = T
  }

  async test() {
    return Promise.reject(new Error('test error'))
  }

  async requireSign(socket, data) {
    const ret = this.t.initRet()
    console.log(`收到来自用户=${socket.request.user} 的消息: ${data}`)
    return ret
  }

  async chat(socket, data) {
    console.log(data, ',,,')
    return Promise.reject(new Error('chat error'))
  }

  async sendOK(socket) {
    const ret = this.t.initRet()

    socket.emit('OK', ret)
  }
})()
