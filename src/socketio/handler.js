/*
 * @Author: helibin@139.com
 * @Date: 2018-08-22 16:02:43
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-08-11 16:16:16
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { T as t } from '../helper'

/** 项目模块 */

export default new (class {
  constructor() {}

  async test() {
    return Promise.reject(new Error('test error'))
  }

  async requireSign(socket, data) {
    console.log(socket.handshake.query, 'socket.handshake.query,,,')
    const ret = t.initRet()
    console.log(`收到来自用户=${socket.handshake.query.token} 的消息: ${data}`)
    return ret
  }

  async chat(socket, data) {
    socket.emit('/chat', data)
  }

  async sendOK(socket) {
    const ret = t.initRet()

    socket.emit('OK', ret)
  }
})()
