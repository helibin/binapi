'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
const ServerError = class extends Error {
  constructor(codeName, message, data) {
    super()

    this.respCode = '401';
    this.respMessage = message;
    this.respData = data;
    // 固定配置错误
    if (codeName === 'EClientNotFound') {
      this.status = 404;
    } else {
      let prefix = ('' + Math.abs(this.respCode))[0];
      switch (prefix) {
        case '0':
          this.status = 200;
          break;

        case '1':
          this.status = 401;
          break;

        case '2':
        case '3':
        case '4':
          this.status = 400;
          break;

        default:
          this.status = 500;
          break;
      }
    }
  }

  toJSON() {
    return {
      err: this.respCode,
      msg: this.respMessage,
      data: this.respData,
    }
  }
}

export default ServerError
