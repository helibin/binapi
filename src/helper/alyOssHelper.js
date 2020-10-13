/*
 * @Author: helibin@139.com
 * @Date: 2018-10-06 16:01:07
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-02-28 11:07:43
 */
/** 内建模块 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'

/** 第三方模块 */
import Oss from 'ali-oss'
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

const ossConfig = CONFIG.alyServer.oss
const alyAk = ossConfig.accessKeyId || CONFIG.alyServer.accessKeyId
const alyAs = ossConfig.accessKeySecret || CONFIG.alyServer.accessKeySecret
const bucket = ossConfig.bucket
let client = {}
let sts = {}

try {
  if (alyAk && alyAs && bucket) {
    client = new Oss({
      accessKeyId: alyAk,
      accessKeySecret: alyAs,
      bucket: bucket,
      region: ossConfig.region,
    })

    sts = new Oss.STS({
      accessKeyId: alyAk,
      accessKeySecret: alyAs,
    })
  } else {
    Log.logger('error', 'alyOss服务缺少参数  : ', `alyAk='${alyAk}', alyAs='${alyAs}', bucket=${bucket}`)
  }
} catch (ex) {
  Log.logger(ex, '初始化阿里云OSS客户端失败: ', JSON.stringify(ex))
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
      this.ctx.state.logger('error', `Oss调用方法: [${chalk.magenta(func)}]发生异常: `, ex)
      this.ctx.state.hasError = true

      throw ex
    } finally {
      this.ctx.state.logger(
        this.ctx.state.hasError,
        `Oss调用方法: [${chalk.magenta(func)}], `,
        `响应: ${this.ctx.state.hasError ? '异常' : '正常'},`,
        chalk.green(`用时: ${Date.now() - now}ms`),
      )
    }
  }

  async _upload(ossClient, ossPath, content, options = {}) {
    assert(ossClient instanceof Oss, 'invalidOssClient')
    assert(typeof ossPath === 'string', 'invalidOssPath')
    assert(is.string(content) || is.buffer(content) || is.readableStream(content), 'invalidContent')
    assert(typeof options === 'object', 'invalidOptions')

    try {
      const ret = this.t.initRet()

      const { name, url } = await ossClient.put(ossPath, content, options).catch((ex) => {
        throw new ce('eAliyunAPI', ex.code, { ex })
      })
      ret.data = { name, url }

      // 上传成功后, 清理缓存
      if (ossConfig.cacheExpire) {
        delete alyServerCache.oss[ossPath]
      }

      this.ctx.state.logger(null, `${chalk.blue('[Oss]')} 文件上传至\`${ossPath}\``)
      return ret
    } catch (ex) {
      this.ctx.state.logger(null, '上传异常', ex)
      if (ex instanceof ce) throw ex
      throw new ce('eAliyunAPI', 'uploadFailed', { ossPath })
    }
  }

  async _download(ossClient, ossPath, options = {}) {
    assert(ossClient instanceof Oss, 'invalidOssClient')
    assert(typeof ossPath === 'string', 'invalidOssPath')
    assert(typeof options === 'object', 'invalidOptions')

    try {
      // options处理
      if (this.ctx.header.range && this.ctx.header.range.match(/bytes=(\d*)-(\d*)/)) {
        options.headers = { Range: this.ctx.header.range }
      }

      if (
        ossConfig.cacheExpire &&
        alyServerCache.oss[ossPath] &&
        alyServerCache.oss[ossPath][this.t.jsonStringify(options)]
      ) {
        const content = alyServerCache.oss[ossPath][this.t.jsonStringify(options)]
        this.ctx.state.logger(
          null,
          `${chalk.magenta('[Oss缓存]')} 从\`${ossPath}\`下载文件`,
          `文件大小: ${content.length}字节 = ${content.length / 1024}KB = ${content.length / 1024 / 1024}MB`,
          `options: ${this.t.jsonStringify(options)}`,
        )

        this.ctx.state.isCacheRes = true
        return content
      }

      const { content } = await ossClient.get(ossPath, options)
      this.ctx.state.logger(
        null,
        `${chalk.blue('[Oss]')} 从\`${ossPath}\`下载文件`,
        `文件大小: ${content.length}字节`,
        `options: ${this.t.jsonStringify(options)}`,
      )

      // 首次下载后, 缓存1MB以内的文件在Web服务器
      if (ossConfig.cacheExpire && content && content.length < 1 * 1024 * 1024) {
        alyServerCache.oss[ossPath] = {
          [this.t.jsonStringify(options)]: content,
        }

        // 缓存自动销毁
        setTimeout(() => {
          delete alyServerCache.oss[ossPath][this.t.jsonStringify(options)]
        }, ossConfig.cacheExpire * 1000)
      }

      return content
    } catch (ex) {
      this.ctx.state.logger(null, '下载异常', ex)
      if (ex instanceof ce) throw ex

      if (ex && ['BadRequest', 'NoSuchKey'].includes(ex.code)) throw new ce('eAliyunAPI', ex.message || ex.code, ex)
      throw new ce('eAliyunAPI', 'downloadFailed', { ossPath })
    }
  }

  /**
   * 上传
   *
   * @param {*} ossPath oss路径, 如: static/img/test.txt
   * @param {any} content 上传内容(String(file path)/Buffer/ReadableStream)
   * @param {object} [options={}] 上传选项(timeout,ms|mime|meta|callback)
   * @returns {object} 公共返回值
   */
  async upload(ossPath, content, options = {}) {
    return this._upload(this.client, ossPath, content, options)
  }

  /**
   * 下载
   *
   * @param {*} ossPath oss路径, 如: static/img/test.txt
   * @param {object} [options={}] 下载选项(timeout|process|headers)
   * @returns {object} 公共返回值
   */
  async download(ossPath, options = {}) {
    return this._download(this.client, ossPath, options)
  }

  /**
   * 获取上传STS令牌
   *
   * @param {*} type 类型
   * @param {*} expireTime 过期时间(15min|1h)
   * @returns {object} stsToken
   */
  async getSTSUploadToken(type = 'common', expireTime = ossConfig.stsTokenExpireTime) {
    try {
      const stsTokenCacheKey = this.t.genCacheKey('upload', this.ctx.state.userId, type)

      // 读取缓存
      const redisRes = await this.ctx.state.redis.get(stsTokenCacheKey)
      if (!this.t.isEmpty(redisRes)) {
        this.ctx.state.isCacheRes = true
        return this.t.jsonParse(redisRes)
      }

      const { credentials } = await sts.assumeRole(ossConfig.rwRoleArn, null, expireTime, this.ctx.state.userId)

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
   * @param {*} expireTime 过期时间(15min|1h)
   * @returns {object} stsToken
   */
  async getSTSDownloadToken(type = 'common', expireTime = ossConfig.stsTokenExpireTime) {
    try {
      const stsTokenCacheKey = this.t.genCacheKey('upload', this.ctx.state.userId, type)

      // 读取缓存
      const redisRes = await this.ctx.state.redis.get(stsTokenCacheKey)
      if (!this.t.isEmpty(redisRes)) {
        this.ctx.state.isCacheRes = true
        return this.t.jsonParse(redisRes)
      }

      const { credentials } = await sts.assumeRole(ossConfig.roRoleArn, null, expireTime, this.ctx.state.userId)

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
   * @param {any} content 上传内容(String(file path)/Buffer/ReadableStream)
   * @param {object} [options={}] 上传选项(timeout|mime|meta|callback)
   * @returns {object} 上传结果
   */
  async stsUpload(credentials, ossPath, content, options = {}) {
    assert(typeof credentials === 'object', 'invalidSTSToken')

    if (dayjs().isAfter(credentials.Expiration)) throw new ce('eAliyunAPI', 'stsTokenExpired', { credentials })

    const stsClient = new Oss({
      accessKeyId: credentials.AccessKeyId,
      accessKeySecret: credentials.AccessKeySecret,
      stsToken: credentials.SecurityToken,
      region: ossConfig.region,
      bucket: ossConfig.bucket,
    })
    return this._upload(stsClient, ossPath, content, options)
  }

  /**
   * sts授权下载
   *
   * @param {object} credentials sts临时令牌
   * @param {string} ossPath oss存储路径
   * @param {object} [options={}] 下载选项(timeout|process|headers)
   * @returns {buffer} 下载结果
   */
  async stsDownload(credentials, ossPath, options = {}) {
    assert(typeof credentials === 'object', 'invalidSTSToken')

    if (dayjs().isAfter(credentials.Expiration)) throw new ce('eAliyunAPI', 'stsTokenExpired', { credentials })

    const stsClient = new Oss({
      accessKeyId: credentials.AccessKeyId,
      accessKeySecret: credentials.AccessKeySecret,
      stsToken: credentials.SecurityToken,
      region: ossConfig.region,
      bucket: ossConfig.bucket,
    })

    return this._download(stsClient, ossPath, options)
  }

  /**
   * sts授权断点续传上传
   *
   * @param {object} credentials sts临时令牌
   * @param {string} ossPath oss存储路径
   * @param {any} content 上传内容(String(file path)/Buffer/ReadableStream)
   * @param {object} [options={}] 上传选项(timeout|mime|meta|callback)
   * @returns {object} 上传结果
   */
  async stsMultipartUpload(credentials, ossPath, content) {
    assert(typeof credentials === 'object', 'credentialsMustBe`object')
    assert(typeof ossPath === 'string', 'ossPathMustBe`string`')

    try {
      const ret = this.t.initRet()

      if (dayjs().isAfter(credentials.Expiration)) throw new ce('eAliyunAPI', 'stsTokenExpired', { credentials })

      if (this.t.isEmpty(content)) return ret

      const stsClient = new Oss({
        accessKeyId: credentials.AccessKeyId,
        accessKeySecret: credentials.AccessKeySecret,
        stsToken: credentials.SecurityToken,
        region: ossConfig.region,
        bucket: ossConfig.bucket,
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
        .catch((ex) => {
          this.ctx.state.logger(ex, ex)
          throw new ce('eAliyunAPI', ex.code)
        })
      // 上传成功后, 清理缓存
      await this.ctx.state.redis.del(checkpointKey)
      if (ossConfig.cacheExpire) {
        delete alyServerCache.oss[ossPath]
      }

      this.ctx.state.logger(null, `${chalk.blue('[Oss]')} 文件成功上传至\`${ossPath}\``)
      return ret
    } catch (ex) {
      this.ctx.state.logger(null, '上传异常', ex)
      if (ex instanceof ce) throw ex
      throw new ce('eAliyunAPI', 'stsUploadFailed', { ossPath })
    }
  }

  async getSignatureUrl(ossPath, options = {}) {
    try {
      const expireTime = options.expires || ossConfig.ossUrlExpireTime

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

      this.ctx.state.logger(null, `${chalk.blue('[Oss]')} 获取文件下载地址\`${url}\``)
      return url
    } catch (ex) {
      this.ctx.state.logger(null, '获取Oss下载链接异常', ex)
      if (ex instanceof ce) throw ex
      throw new ce('eAliyunAPI', 'getOssUrlFailed', { ossPath })
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
    const ossName = ossPath.startsWith('/') ? ossPath.subString(1) : ossPath
    return new Promise((resolve) => {
      const tmpPath = path.resolve(__dirname, `../upload/tmp-3rd-${Date.now()}.${this.t.genRandStr(8)}.png`)
      const ws = fs.createWriteStream(tmpPath)

      this.ctx.state.axios
        .get(url, null, { responseType: 'stream' })
        .then((urlRes) => {
          urlRes.pipe(ws)
          ws.on('finish', async () => {
            await this.upload(ossName, tmpPath)
            fs.unlinkSync(tmpPath)
            resolve(ossPath)
          })
        })
        .catch((ex) => {
          this.ctx.state.logger(ex, 'url文件上传失败', ex && (ex.message || ex.statusMessage))

          fs.unlinkSync(tmpPath)
          resolve()
        })
    })
  }

  /**
   *
   * @param {string} ossPathPrefix oss前缀匹配
   * @returns {int} 大小, 字节=KB * 1024
   */
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
// Oss升级通知 https://help.aliyun.com/noticelist/articleid/24226493.html?spm=a2c4g.11186623.2.15.35fa4c07KHCwZn
