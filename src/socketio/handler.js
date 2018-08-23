/*
 * @Author: helibin@139.com
 * @Date: 2018-08-22 16:02:43
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-23 11:18:23
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { _e, t } from '../helper';

/** 项目模块 */


export default new class {
  constructor() {
    this.ret = t.initRet();
  }

  async test(socket, data) {
    console.log(data, ',,,');
    return Promise.reject(new Error('test error'));
  }

  async requireSign(socket, data) {
    const ret = t.initRet();
    const handshake = socket.handshake;
    console.log(handshake.query, ',,,');
    console.log(`收到来自用户=${socket.request.user} 的消息: ${data}`);
    return ret;
  }

  async chat(socket, data) {
    console.log(data, ',,,');
    return Promise.reject(new Error('chat error'));
  }

  async sendOK(socket) {
    const ret = t.initRet();

    socket.emit('OK', ret);
  }
}();
