/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-20 21:25:26
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { CONST } from './yamlCC';


export default class CustomError {
  constructor(codeName, message, data) {
    this.name = 'CustomError';
    this.respCode = CONST.respCode[codeName] || CONST.respCode.Unknown;
    this.respMessage = message;
    this.respData = data;

    // 固定配置错误
    if (codeName === 'EClientNotFound') {
      this.status = 404;
    } else {
      const prefix = (`${Math.abs(this.respCode)}`)[0];
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
      err : this.respCode,
      msg : this.respMessage,
      data: this.respData,
    };
  }
}
