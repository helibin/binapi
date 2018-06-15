'use strict'

/** 内建模块 */
import util from 'util'

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import httpCode from './httpStatusCode'
import yamlData from './yamlCC'



export default class ServerError extends Error {
  constructor(codeName, message, data) {
    super()

    this.err = yamlData.const.respCode[codeName];
    this.msg = message;
    this.data = data;

    // 固定配置错误
    if (codeName === 'EClientNotFound') {
      this.status = 404;
    } else {
      let prefix = ('' + Math.abs(this.err))[0];
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
    console.log('toJSON', ',,,');
    return {
      err: this.respCode,
      msg: this.respMessage,
      data: this.respData,
    }
  }
}
