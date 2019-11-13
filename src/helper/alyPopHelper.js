/*
 * @Author: helibin@139.com
 * @Date: 2018-08-08 21:55:49
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-06 16:05:33
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
    const alyAK = CONFIG.alyServer[type].accessKeyId || CONFIG.alyServer.accessKeyId
    const alyAS = CONFIG.alyServer[type].accessKeySecret || CONFIG.alyServer.accessKeySecret

    if (alyAK && alyAS) {
      return new PopCore({
        accessKeyId: alyAK,
        secretAccessKey: alyAS,
        endpoint: CONFIG.alyServer[type].endpoint,
        apiVersion: CONFIG.alyServer[type].apiVersion,
      })
    } else {
      logger('error', `aly${type}服务缺少参数：`, `alyAK='${alyAK}', alyAS='${alyAS}'`)
    }
  } catch (ex) {
    logger(ex, '初始化阿里云客户端失败：', JSON.stringify(ex))
    throw ex
  }
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.client = alyClient
    this.t = T
  }

  async run(type, func, ...args) {
    try {
      const alyRes = await this.client(type)[func](...args)

      return alyRes.Data
    } catch (ex) {
      logger(ex, `调用阿里云${type}服务失败, `, `func: ${func}, `, `参数: ${this.t.jsonStringify(...args)}`, ex)
      throw new ce('EAliyunAPI', `${type}-${func}Failed`, ex.data)
    }
  }

  async iot(action, params, extraOpt) {
    return await this.run(
      'iot',
      'request',
      action,
      {
        ...params,
        RegionId: params.RegionId || CONFIG.alyServer.iot.regionId,
        ProductKey: params.ProductKey || CONFIG.alyServer.iot.productKey,
      },
      extraOpt,
    )
  }
}

// iotAPI https://help.aliyun.com/document_detail/69470.html?spm=a2c4g.11186623.6.719.32ef3e99YTL79J
