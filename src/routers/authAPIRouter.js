'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../base_modules/tools'

/** 项目模块 */
import * as authAPICtrl from '../controllers/authAPICtrl'



const apiRouter = new Router({
  prefix: CONFIG.apiServer.prefix
})

apiRouter.post('/auth/do/sign-in', authAPICtrl.signIn)

export default apiRouter
