'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../baseModules/tools'

/** 项目模块 */
import * as userAPICtrl from '../controllers/userAPICtrl'



const apiRouter = new Router({
  prefix: CONFIG.apiServer.prefix
})

apiRouter.get('/auth/users/:targetId/do/get'
  , userAPICtrl.getUser
)

export default apiRouter
