/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-31 21:38:13
 */
/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */
import { CONFIG, YamlCC, T as t, ce } from '../helper'

/** 项目模块 */
import pc from '../data/pc-code'
import pca from '../data/pca-code'
import i18n from '../i18n'
import { ipMid } from '../middleware'
import { databaseCtrl } from '../controller'

/** 预处理 */
const router = new Router({ prefix: CONFIG.apiServer.prefix || '' })
const pageRouter = new Router({ prefix: CONFIG.webServer.prefix || '' })

/**
 * @api {post} /areas/pc 省市联动数据
 * @apiName pc
 * @apiVersion 1.0.0
 * @apiGroup Base
 *
 * @apiSampleRequest /areas/pc
 */
router.all('/areas/pc', ctx => {
  ctx.state.sendFile(pc)
})

/**
 * @api {post} /areas/pca 省市县联动数据
 * @apiName pca
 * @apiVersion 1.0.0
 * @apiGroup Base
 *
 * @apiSampleRequest /areas/pca
 */
router.all('/areas/pca', ctx => {
  ctx.state.sendFile(pca)
})

/**
 * @api {post} /hi say hello
 * @apiName hi
 * @apiVersion 1.0.0
 * @apiGroup Base
 *
 * @apiSampleRequest /hi
 */
router.all('/hi', ctx => {
  ctx.state.sendJSON(
    t.initRet({
      server: CONFIG.site.baseUrl,
      env: process.env.NODE_ENV,
    }),
  )
})

/**
 * @api {post} /ua 获取用户代理（ua)
 * @apiName ua
 * @apiVersion 1.0.0
 * @apiGroup Base
 *
 * @apiSampleRequest /ua
 */
router.all('/ua', ctx => {
  ctx.state.sendJSON(
    t.initRet({
      browser: ctx.userAgent.browser,
      version: ctx.userAgent.version,
      os: ctx.userAgent.os,
      platform: ctx.userAgent.platform,
      ua: ctx.userAgent,
    }),
  )
})

/**
 * @api {post} /const 获取常量
 * @apiName const
 * @apiVersion 1.0.0
 * @apiGroup Base
 *
 * @apiSampleRequest /const
 */
router.all('/const', ctx => {
  ctx.state.sendJSON(t.initRet(YamlCC.CONST))
})

/**
 * @api {post} /resp-code 获取响应码
 * @apiName resp-code
 * @apiVersion 1.0.0
 * @apiGroup Base
 *
 * @apiParam (Query) {string} lan=zh 语言（zh|en）
 *
 * @apiSampleRequest /resp-code
 */
router.all('/resp-code', ctx => {
  ctx.state.sendJSON(t.initRet(i18n[ctx.query.lan || 'zh'].resCode))
})

router.all('/413', ctx => {
  ctx.state.sendJSON(new ce('requestEntityTooLarge'))
})

router.get('/database/do/init', ipMid.allowAccess(CONFIG.apiServer.ipAddress), databaseCtrl.run('init'))

export default router
export { router, pageRouter }

/**
 * @api {all} /xxx API通用参数及响应值
 * @apiName all
 * @apiVersion 1.0.0
 * @apiGroup Base
 *
 * @apiUse commonParam
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 */

/**
 * @apiDefine commonParam
 *
 * @apiParam (Query) {string} [paging=0] 是否分页（1|0）
 * @apiParam (Query) {string} [page] 页码
 * @apiParam (Query) {string} [psize] 分页大小
 *
 * @apiHeader {string} x-auth-token 用户认证令牌
 * @apiHeader {string} [Content-Type=application/json] application/json|application/x-www-form-urlencoded
 */

/**
 * @apiDefine commonSuccessRes
 *
 * @apiSuccess {string} status http状态码
 * @apiSuccess {string} code 错误代码
 * @apiSuccess {string} msg 错误消息
 * @apiSuccess {json} [data] 额外数据
 * @apiSuccess {int(13)} ts 当前时间戳
 * @apiSuccess {string(32)} req_id 请求ID
 *
 * @apiSuccess (pageInfo) {int} total 总数
 * @apiSuccess (pageInfo) {int} page 页码
 * @apiSuccess (pageInfo) {int} psize 分页大小
 * @apiSuccess (pageInfo) {int} pages 总页数
 *
 * @apiSuccess (dataField) {string} seq 序号
 * @apiSuccess (dataField) {string(32)} id UUID
 * @apiSuccess (dataField) {string(32)} creator_id 创建者ID
 * @apiSuccess (dataField) {string(32)} editor_id 编辑者ID
 * @apiSuccess (dataField) {int(1)} is_disabled 是否禁用（0|1）
 * @apiSuccess (dataField) {date} created_at 创建时间（ISO8601）
 * @apiSuccess (dataField) {date} updated_at 修改时间（ISO8601）
 *
 * @apiSuccessExample {json} Common-Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "status": 200,
 *    "code": 0,
 *    "msg": "成功",
 *    "ts": ts
 *    "req_id": req_id,
 *  }
 */

/**
 * @apiDefine commonErrorRes
 *
 * @apiError {string} status http状态码
 * @apiError {string} code 错误代码
 * @apiError {string} msg 错误消息
 * @apiError {json} [data] 额外数据
 * @apiError {int(13)} ts 当前时间戳
 * @apiError {string(32)} req_id 请求ID
 * @apiError {string} invalidXAuthToken 无效认证令牌
 * @apiError {string} xAuthTokenExpired 认证令牌已过期
 * @apiError {string} userNotSignedIn 用户未登录
 *
 * @apiErrorExample {json} Common-Error-Response:
 *  HTTP/1.1 200 Bad Request
 *  {
 *    "status": 401,
 *    "code": 10010,
 *    "msg": "无效认证令牌",
 *    "data": {
 *      "x_auth_token": x_auth_token
 *    }
 *    "req_id": req_id,
 *    "ts": ts
 *  }
 *
 *  HTTP/1.1 200 Bad Request
 *  {
 *    "status": 401,
 *    "code": 10020,
 *    "msg": "认证令牌已过期",
 *    "data": {
 *      "x_auth_token": x_auth_token
 *    }
 *    "ts": ts
 *    "req_id": req_id,
 *  }
 *
 *  HTTP/1.1 200 Unauthorized
 *  {
 *    "status": 401,
 *    "code": 10000,
 *    "msg": "用户未登录",
 *    "ts": ts
 *    "req_id": req_id,
 *  }
 */
