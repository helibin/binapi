/*
 * @Author: helibin@139.com
 * @Date: 2018-10-06 16:01:07
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-06 14:06:40
 */
/** 内建模块 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'

/** 第三方模块 */
import OSS from 'ali-oss'
import chalk from 'chalk'
import dayjs from 'dayjs'
import is from 'is-type-of'

/** 基础模块 */
import CONFIG from 'config'
import ce from './customError'
import T from './toolkit'

/** 项目模块 */
import Log from './logger'

// 缓存
const alyServerCache = { oss: {} }

const alyAK = CONFIG.alyServer.oss.accessKeyId || CONFIG.alyServer.accessKeyId
const alyAS = CONFIG.alyServer.oss.accessKeySecret || CONFIG.alyServer.accessKeySecret
let client = {}
let sts = {}

if (alyAK && alyAS) {
  client = new OSS({
    accessKeyId: alyAK,
    accessKeySecret: alyAS,
    region: CONFIG.alyServer.oss.region,
    bucket: CONFIG.alyServer.oss.bucket,
  })

  sts = new OSS.STS({
    accessKeyId: alyAK,
    accessKeySecret: alyAS,
  })
} else {
  Log.logger('error', 'alyOss服务缺少参数  ：', `alyAK='${alyAK}', alyAS='${alyAS}'`)
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.client = client
    this.t = T
  }

  async run(func, ...args) {
    const now = Date.now()
    try {
      if (typeof this[func] === 'function') {
        return await this[func](...args)
      }

      return await this.client[func](...args)
    } catch (ex) {
      this.ctx.state.logger('error', `OSS调用方法：[${chalk.magenta(func)}]发生异常：`, ex)
      this.ctx.state.hasError = true

      throw ex
    } finally {
      this.ctx.state.logger(
        this.ctx.state.hasError,
        `OSS调用方法：[${chalk.magenta(func)}], `,
        `响应：${this.ctx.state.hasError ? '异常' : '正常'},`,
        chalk.green(`用时：${Date.now() - now}ms`),
      )
    }
  }

  async _upload(ossClient, ossPath, content, options = {}) {
    assert(ossClient instanceof OSS, 'invalidOSSClient')
    assert(typeof ossPath === 'string', 'invalidOSSPath')
    assert(is.string(content) || is.buffer(content) || is.readableStream(content), 'invalidContent')
    assert(typeof options === 'object', 'invalidOptions')

    try {
      const ret = this.t.initRet()

      const { name, url } = await ossClient.put(ossPath, content, options).catch(ex => {
        throw new ce('eAliyunAPI', ex.code, { ex })
      })
      ret.data = { name, url }

      // 上传成功后, 清理缓存
      if (CONFIG.alyServer.oss.cacheExpire) {
        delete alyServerCache.oss[ossPath]
      }

      this.ctx.state.logger(null, `${chalk.blue('[OSS]')} 文件上传至\`${ossPath}\``)
      return ret
    } catch (ex) {
      this.ctx.state.logger(null, '上传异常', ex)
      if (ex instanceof ce) throw ex
      throw new ce('eAliyunAPI', 'uploadFailed', { ossPath })
    }
  }

  async _download(ossClient, ossPath, options = {}) {
    assert(ossClient instanceof OSS, 'invalidOSSClient')
    assert(typeof ossPath === 'string', 'invalidOSSPath')
    assert(typeof options === 'object', 'invalidOptions')

    try {
      // options处理
      if (this.ctx.header.range && this.ctx.header.range.match(/bytes=(\d*)-(\d*)/)) {
        options.headers = { Range: this.ctx.header.range }
      }

      if (
        CONFIG.alyServer.oss.cacheExpire &&
        alyServerCache.oss[ossPath] &&
        alyServerCache.oss[ossPath][this.t.jsonStringify(options)]
      ) {
        const content = alyServerCache.oss[ossPath][this.t.jsonStringify(options)]
        this.ctx.state.logger(
          null,
          `${chalk.magenta('[OSS缓存]')} 从\`${ossPath}\`下载文件`,
          `文件大小：${content.length}字节 = ${content.length / 1024}KB = ${content.length / 1024 / 1024}MB`,
          `options: ${this.t.jsonStringify(options)}`,
        )

        this.ctx.state.isCacheRes = true
        return content
      }

      const { content } = await ossClient.get(ossPath, options)
      this.ctx.state.logger(
        null,
        `${chalk.blue('[OSS]')} 从\`${ossPath}\`下载文件`,
        `文件大小：${content.length}字节`,
        `options: ${this.t.jsonStringify(options)}`,
      )

      // 首次下载后, 缓存1MB以内的文件在Web服务器
      if (CONFIG.alyServer.oss.cacheExpire && content && content.length < 1 * 1024 * 1024) {
        alyServerCache.oss[ossPath] = {
          [this.t.jsonStringify(options)]: content,
        }

        // 缓存自动销毁
        setTimeout(() => {
          delete alyServerCache.oss[ossPath][this.t.jsonStringify(options)]
        }, CONFIG.alyServer.oss.cacheExpire * 1000)
      }

      return content
    } catch (ex) {
      this.ctx.state.logger(null, '下载异常', ex)
      if (ex instanceof ce) throw ex

      if (ex.code === 'NoSuchKey') throw new ce('noSuchResource', null, { ossPath })
      throw new ce('eAliyunAPI', 'downloadFailed', { ossPath })
    }
  }

  /**
   * 上传
   *
   * @param {*} ossPath oss路径, 如：static/img/test.txt
   * @param {any} content 上传内容（String(file path)/Buffer/ReadableStream）
   * @param {object} [options={}] 上传选项（timeout,ms|mime|meta|callback）
   * @returns {object} 公共返回值
   */
  async upload(ossPath, content, options = {}) {
    return this._upload(this.client, ossPath, content, options)
  }

  /**
   * 下载
   *
   * @param {*} ossPath oss路径, 如：static/img/test.txt
   * @param {object} [options={}] 下载选项（timeout|process|headers）
   * @returns {object} 公共返回值
   */
  async download(ossPath, options = {}) {
    return this._download(this.client, ossPath, options)
  }

  /**
   * 获取上传STS令牌
   *
   * @param {*} type 类型
   * @param {*} expireTime 过期时间（15min|1h）
   * @returns {object} stsToken
   */
  async getSTSUploadToken(type = 'common', expireTime = CONFIG.alyServer.oss.stsTokenExpireTime) {
    try {
      const stsTokenCacheKey = this.t.genCacheKey('upload', this.ctx.state.userId, type)

      // 读取缓存
      const redisRes = await this.ctx.state.redis.get(stsTokenCacheKey)
      if (!this.t.isEmpty(redisRes)) {
        this.ctx.state.isCacheRes = true
        return this.t.jsonParse(redisRes)
      }

      const { credentials } = await sts.assumeRole(
        CONFIG.alyServer.oss.rwRoleArn,
        null,
        expireTime,
        this.ctx.state.userId,
      )

      // 缓存stsToken
      await this.ctx.state.redis.set(stsTokenCacheKey, this.t.jsonStringify(credentials), expireTime)

      return credentials
    } catch (ex) {
      this.ctx.state.logger(null, '获取上传credentials异常', ex)
      if (ex instanceof ce) throw ex
      throw new ce('eAliyunAPI', 'getSTSUploadTokenFailed', { type })
    }
  }

  /**
   * 获取下载STS令牌
   *
   * @param {*} type 类型
   * @param {*} expireTime 过期时间（15min|1h）
   * @returns {object} stsToken
   */
  async getSTSDownloadToken(type = 'common', expireTime = CONFIG.alyServer.oss.stsTokenExpireTime) {
    try {
      const stsTokenCacheKey = this.t.genCacheKey('upload', this.ctx.state.userId, type)

      // 读取缓存
      const redisRes = await this.ctx.state.redis.get(stsTokenCacheKey)
      if (!this.t.isEmpty(redisRes)) {
        this.ctx.state.isCacheRes = true
        return this.t.jsonParse(redisRes)
      }

      const { credentials } = await sts.assumeRole(
        CONFIG.alyServer.oss.roRoleArn,
        null,
        expireTime,
        this.ctx.state.userId,
      )

      // 缓存stsToken
      await this.ctx.state.redis.set(stsTokenCacheKey, this.t.jsonStringify(credentials), expireTime)

      return credentials
    } catch (ex) {
      this.ctx.state.logger(null, '获取下载credentials异常')
      if (ex instanceof ce) throw ex
      throw new ce('eAliyunAPI', 'getSTSDownloadTokenFailed', ex)
    }
  }

  /**
   * sts授权上传
   *
   * @param {object} credentials sts临时令牌
   * @param {string} ossPath oss存储路径
   * @param {any} content 上传内容（String(file path)/Buffer/ReadableStream）
   * @param {object} [options={}] 上传选项（timeout|mime|meta|callback）
   * @returns {object} 上传结果
   */
  async stsUpload(credentials, ossPath, content, options = {}) {
    assert(typeof credentials === 'object', 'invalidSTSToken')

    if (dayjs().isAfter(credentials.Expiration)) throw new ce('eAliyunAPI', 'stsTokenExpired', { credentials })

    const stsClient = new OSS({
      accessKeyId: credentials.AccessKeyId,
      accessKeySecret: credentials.AccessKeySecret,
      stsToken: credentials.SecurityToken,
      region: CONFIG.alyServer.oss.region,
      bucket: CONFIG.alyServer.oss.bucket,
    })
    return this._upload(stsClient, ossPath, content, options)
  }

  /**
   * sts授权下载
   *
   * @param {object} credentials sts临时令牌
   * @param {string} ossPath oss存储路径
   * @param {object} [options={}] 下载选项（timeout|process|headers）
   * @returns {buffer} 下载结果
   */
  async stsDownload(credentials, ossPath, options = {}) {
    assert(typeof credentials === 'object', 'invalidSTSToken')

    if (dayjs().isAfter(credentials.Expiration)) throw new ce('eAliyunAPI', 'stsTokenExpired', { credentials })

    const stsClient = new OSS({
      accessKeyId: credentials.AccessKeyId,
      accessKeySecret: credentials.AccessKeySecret,
      stsToken: credentials.SecurityToken,
      region: CONFIG.alyServer.oss.region,
      bucket: CONFIG.alyServer.oss.bucket,
    })

    return this._download(stsClient, ossPath, options)
  }

  /**
   * sts授权断点续传上传
   *
   * @param {object} credentials sts临时令牌
   * @param {string} ossPath oss存储路径
   * @param {any} content 上传内容（String(file path)/Buffer/ReadableStream）
   * @param {object} [options={}] 上传选项（timeout|mime|meta|callback）
   * @returns {object} 上传结果
   */
  async stsMultipartUpload(credentials, ossPath, content) {
    assert(typeof credentials === 'object', 'credentialsMustBe`object')
    assert(typeof ossPath === 'string', 'ossPathMustBe`string`')

    try {
      const ret = this.t.initRet()

      if (dayjs().isAfter(credentials.Expiration)) throw new ce('eAliyunAPI', 'stsTokenExpired', { credentials })

      if (this.t.isEmpty(content)) return ret

      const stsClient = new OSS({
        accessKeyId: credentials.AccessKeyId,
        accessKeySecret: credentials.AccessKeySecret,
        stsToken: credentials.SecurityToken,
        region: CONFIG.alyServer.oss.region,
        bucket: CONFIG.alyServer.oss.bucket,
      })

      // 断点恢复
      const checkpointKey = this.t.genCacheKey('checkpoint', 'stsMultipartUpload', this.ctx.state.userId, ossPath)
      let checkpoint = this.t.jsonParse(await this.ctx.state.redis.get(checkpointKey))
      // 分片上传
      const that = this
      await stsClient
        .multipartUpload(ossPath, content, {
          parallel: 3,
          partSize: 102400, // 100K
          checkpoint,
          progress: async (p, cpt) => {
            await that.ctx.state.redis.set(checkpointKey, this.t.jsonStringify(cpt), CONFIG.site.ossTempFileMaxAge)
            checkpoint = cpt
          },
          meta: {
            year: new Date().getFullYear(),
            user: that.ctx.state.userId,
          },
        })
        .catch(ex => {
          this.ctx.state.logger(ex, ex)
          throw new ce('eAliyunAPI', ex.code)
        })
      // 上传成功后, 清理缓存
      await this.ctx.state.redis.del(checkpointKey)
      if (CONFIG.alyServer.oss.cacheExpire) {
        delete alyServerCache.oss[ossPath]
      }

      this.ctx.state.logger(null, `${chalk.blue('[OSS]')} 文件成功上传至\`${ossPath}\``)
      return ret
    } catch (ex) {
      this.ctx.state.logger(null, '上传异常', ex)
      if (ex instanceof ce) throw ex
      throw new ce('eAliyunAPI', 'stsUploadFailed', { ossPath })
    }
  }

  async getSignatureUrl(ossPath, options = {}) {
    try {
      const expireTime = options.expires || CONFIG.alyServer.oss.ossUrlExpireTime

      const ossUrlCacheKey = this.t.genCacheKey('ossUrl', ossPath, this.t.jsonStringify(options))

      // 读取缓存
      const redisRes = await this.ctx.state.redis.get(ossUrlCacheKey)
      if (!this.t.isEmpty(redisRes)) {
        return this.t.jsonParse(redisRes)
      }

      const url = this.client.signatureUrl(ossPath, {
        ...options,
        expires: expireTime,
      })

      // 获取成功后, 缓存
      await this.ctx.state.redis.set(ossUrlCacheKey, this.t.jsonStringify(url), expireTime)

      this.ctx.state.logger(null, `${chalk.blue('[OSS]')} 获取文件下载地址\`${url}\``)
      return url
    } catch (ex) {
      this.ctx.state.logger(null, '获取OSS下载链接异常', ex)
      if (ex instanceof ce) throw ex
      throw new ce('eAliyunAPI', 'getOSSUrlFailed', { ossPath })
    }
  }

  async move(oldOssPath, newOssPath) {
    try {
      await this.client.copy(newOssPath, oldOssPath)
      await this.client.delete(oldOssPath)
    } catch (ex) {
      this.ctx.state.logger(ex, 'oss文件移动失败', ex)
      throw ex
    }
  }

  async uploadByUrl(ossPath, url) {
    return new Promise((resolve, reject) => {
      const tmpPath = path.resolve(__dirname, `../upload/tmp-3rd-${Date.now()}.${this.t.genRandStr(8)}.png`)
      const ws = fs.createWriteStream(tmpPath)

      this.ctx.state.axios.get(url, null, { responseType: 'stream' }).then(urlRes => {
        urlRes.pipe(ws)
        ws.on('finish', async () => {
          await this.upload(ossPath, tmpPath)
          fs.unlinkSync(tmpPath)
          resolve(ossPath)
        }).on('error', async ex => {
          this.ctx.state.logger(ex, 'url文件上传失败', ex)
          reject()
        })
      })
    })
  }

  async getOssPathSize(ossPathPrefix) {
    const { objects } = await this.run('list', {
      prefix: ossPathPrefix,
    })
    let size = 0
    for (const d of objects) {
      size += d.size
    }

    return size
  }
}

// https://github.com/ali-sdk/ali-oss/blob/master/README.md
