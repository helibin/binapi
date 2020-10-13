/*
 * @Author: helibin@139.com
 * @Date: 2018-08-08 21:55:49
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-02-28 09:53:47
 */
/** 内建模块 */

/** 第三方模块 */
import PopCore from '@alicloud/pop-core'

/** 基础模块 */
import CONFIG from 'config'
import ce from './customError'
import { logger } from './logger'
import T from './toolkit'

/** 项目模块 */

/** 预处理 */

// 创建aly产品客户端
const alyClient = (type = 'common') => {
  try {
    const alyAk = CONFIG.alyServer[type].accessKeyId || CONFIG.alyServer.accessKeyId
    const alyAs = CONFIG.alyServer[type].accessKeySecret || CONFIG.alyServer.accessKeySecret

    if (alyAk && alyAs) {
      return new PopCore({
        accessKeyId: alyAk,
        accessKeySecret: alyAs,
        endpoint: CONFIG.alyServer[type].endpoint,
        apiVersion: CONFIG.alyServer[type].apiVersion,
      })
    } else {
      logger('error', `aly${type}服务缺少参数: `, `alyAk='${alyAk}', alyAs='${alyAs}'`)
    }
  } catch (ex) {
    logger(ex, '初始化阿里云客户端失败: ', JSON.stringify(ex))
    throw ex
  }
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.client = alyClient
    this.t = T
  }

  async run(type, action, ...args) {
    try {
      const alyRes = await this.client(type).request(action, ...args)

      logger(
        'debug',
        `调用阿里云${type}服务成功, `,
        `func: ${func}, `,
        `参数: ${this.t.jsonStringify(args)}, `,
        `响应: ${this.t.jsonStringify(alyRes)}`,
      )
      return alyRes.Data
    } catch (ex) {
      logger(ex, `调用阿里云${type}服务失败, `, `func: ${func}, `, `参数: ${this.t.jsonStringify(...args)}`, ex)
      throw new ce('EAliyunAPI', `${type}-${func}Failed`, ex.data)
    }
  }

  async iot(action, params = {}, extraOpt = {}) {
    const alyConf = CONFIG.alyServer.iot

    return await this.run(
      'iot',
      action,
      {
        ...params,
        RegionId: params.RegionId || alyConf.regionId,
        ProductKey: params.ProductKey || alyConf.productKey,
      },
      extraOpt,
    )
  }

  async sms(action, params = {}, extraOpt = {}) {
    const alyConf = CONFIG.alyServer.sms

    return await this.run(
      'sms',
      action,
      {
        ...params,
        PhoneNumbers: params.PhoneNumbers,
        TemplateParam: params.TemplateParam,
        SignName: params.SignName || alyConf.signName,
        TemplateCode: params.TemplateCode || alyConf.template.default,
        RegionId: params.RegionId || alyConf.regionId,
      },
      extraOpt,
    )
  }
}

// https://api.aliyun.com
// iotAPI https://help.aliyun.com/document_detail/69470.html?spm=a2c4g.11186623.6.719.32ef3e99YTL79J
