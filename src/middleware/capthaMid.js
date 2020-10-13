/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-12-27 16:08:54
 */
/** 内建模块 */

/** 第三方模块 */
import svgCaptcha from 'svg-captcha'
import pngCaptcha from 'captchapng/lib/captchapng'

/** 基础模块 */
import CONFIG from 'config'
import Base from './base'

/** 项目模块 */

/** 预处理 */
const captchaOpt = {
  width: 150,
  height: 60,
  fontSize: 50,
  ignoreChars: '0oO1iIl',
  noise: 1,
  color: false,
}

module.exports = new (class extends Base {
  /**
   * 创建图形验证码缓存键值
   *
   * @param {string} type 图形验证码类型(svg|png)
   * @param {string} cate 图形验证码分类
   * @param {string} clientId 客户端ID
   * @param {string} token 图形验证码Token
   * @returns {string} 图形验证码缓存键值
   */
  createCapthaCacheKey(type, cate, clientId, token) {
    return `captcha@${cate}#user=${CONFIG.webServer.name}:type=${type}:clientId=${clientId}:token=${token}`
  }

  genCaptchaTest() {
    return async (ctx, next) => {
      const ret = this.t.initRet()
      let start = Date.now()
      const count = {
        svg: 0,
        png: 0,
        gif: 0,
      }

      while (Date.now() - start < 1000) {
        svgCaptcha.create(captchaOpt)
        count.svg += 1
      }

      start = Date.now()
      while (Date.now() - start < 1000) {
        const captchaText = this.t.genRandStr(4, '1234567890')
        const captchaContent = pngCaptcha(captchaOpt.width, captchaOpt.height, captchaText)
        captchaContent.color(0, 0, 0, 0)
        captchaContent.color(80, 80, 80, 255)
        captchaContent.base64Encode()
        count.png += 1
      }

      ctx.state.logger('debug', '1秒内生成图形验证码: ', count)
      ret.data = { count }
      ctx.state.sendJSON(ret)
      await next()
    }
  }

  getSVGCaptcha(cate) {
    return async ctx => {
      cate = cate || ctx.query.cate || 'common'

      try {
        const cacheKey = this.createCapthaCacheKey('svg', cate, ctx.state.clientId, ctx.query.captcha_token)

        const { data, text } = svgCaptcha.create(captchaOpt)

        await ctx.state.redis.set(cacheKey, text, this.CONFIG.webServer.captchaMaxAge.svg)

        ctx.state.logger('debug', `生成[${cate}]图形验证码成功: captcha: ${text}`)
        ctx.state.sendMedia(data, 'svg')
      } catch (ex) {
        ctx.state.logger(ex, `生成[${cate}]图形验证码失败`)
        throw ex
      }
    }
  }

  verifySVGCaptha(cate = 'common') {
    return async (ctx, next) => {
      if (['signIn', 'signUp'].includes(cate)) {
        if (this.CONFIG.webServer.skipAuthCaptcha) return next()
      } else if (this.CONFIG.webServer.skipCaptcha) return next()

      try {
        const captchaToken = ctx.request.body.captcha_token
        const captcha = ctx.request.body.captcha
        const cacheKey = this.createCapthaCacheKey('svg', cate, ctx.state.clientId, captchaToken)

        // 校验缓存图形验证码
        const cacheCaptcha = await ctx.state.redis.get(cacheKey)
        if (this.t.isEmpty(cacheCaptcha)) throw new this.ce('invalidCaptchaToken', { captcha_token: captchaToken })

        await ctx.state.redis.del(cacheKey)
        if (captcha && cacheCaptcha.toLowerCase() !== captcha.toLowerCase()) {
          throw new this.ce('invalidCaptcha', { captcha })
        }

        ctx.state.logger('debug', `校验[${cate}]图形验证码成功: captcha: ${captcha}`)
        return next()
      } catch (ex) {
        ctx.state.logger(ex, `校验[${cate}]图形验证码失败`)
        throw ex
      }
    }
  }

  genPNGCaptcha(cate) {
    return async ctx => {
      cate = cate || ctx.query.cate || 'common'

      try {
        const cacheKey = this.createCapthaCacheKey('png', cate, ctx.state.clientId, ctx.query.captcha_token)

        // 生成图形验证码
        const text = this.t.genRandStr(4, '1234567890')
        const captcha = pngCaptcha(captchaOpt.width, captchaOpt.height, text)
        captcha.color(0, 0, 0, 0)
        captcha.color(80, 80, 80, 255)
        const data = Buffer.from(captcha.base64Encode(), 'base64')

        await ctx.state.redis.set(cacheKey, text, this.CONFIG.webServer.captchaMaxAge.png)

        ctx.state.logger('debug', `生成[${cate}]图形验证码成功: captcha: ${text}`)
        ctx.state.sendMedia(data, 'png')
      } catch (ex) {
        ctx.state.logger(ex, `生成[${cate}]图形验证码失败`)
        throw ex
      }
    }
  }

  verifyPNGCaptha(cate = 'common') {
    return async (ctx, next) => {
      if (['signIn', 'signUp'].includes(cate)) {
        if (this.CONFIG.webServer.skipAuthCaptcha) return next()
      } else if (this.CONFIG.webServer.skipCaptcha) return next()

      try {
        const captchaToken = ctx.request.body.captcha_token
        const captcha = ctx.request.body.captcha
        const cacheKey = this.createCapthaCacheKey('png', cate, ctx.state.clientId, captchaToken)

        // 校验缓存图形验证码
        const cacheCaptcha = await ctx.state.redis.get(cacheKey)
        if (this.t.isEmpty(cacheCaptcha)) throw new this.ce('invalidCaptchaToken', { captcha_token: captchaToken })

        await ctx.state.redis.del(cacheKey)
        if (cacheCaptcha && captcha && cacheCaptcha.toLowerCase() !== captcha.toLowerCase()) {
          throw new this.ce('invalidCaptcha', { captcha })
        }

        ctx.state.logger('debug', `校验[${cate}]图形验证码成功: captcha: ${captcha}`)
        return next()
      } catch (ex) {
        ctx.state.logger(ex, `校验[${cate}]图形验证码失败`)
        throw ex
      }
    }
  }
})()
