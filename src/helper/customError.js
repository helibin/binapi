/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-30 14:41:34
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { RESPCODE } from './yamlCC'

module.exports = class CustomError {
  constructor(codeName, message, data) {
    this.name = 'CustomError'
    this.respCode = RESPCODE[codeName] || RESPCODE.unknown
    this.respMessage = message || codeName
    this.respData = data

    if (message && typeof message === 'object') {
      this.respMessage = codeName
      this.respData = message
    }

    if (['noSuchRouter'].includes(codeName)) {
      this.httpStatus = 404
    } else {
      const prefix = `${Math.abs(this.respCode)}`[0]
      switch (prefix) {
        case '0':
          this.httpStatus = 200
          break

        case '1':
          this.httpStatus = 401
          break

        case '2':
        case '3':
        case '4':
          this.httpStatus = 400
          break

        default:
          this.httpStatus = 500
          break
      }
    }

    // 响应状态码统一改成200
    this.status = 200
  }

  toJSON() {
    return {
      status: this.httpStatus,
      code: this.respCode,
      msg: this.respMessage,
      data: this.respData,
    }
  }
}
