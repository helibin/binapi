'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'
import _ from 'lodash'

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../baseModules/tools'

/** 项目模块 */
import * as likesAPICtrl from '../controllers/likesAPICtrl'


const apiRouter = new Router({
  prefix: CONFIG.apiServer.prefix
})

apiRouter.get('/likes/do/list', likesAPICtrl.listLikes)

apiRouter.post('/likes/do/add', likesAPICtrl.addLike)

export default apiRouter
