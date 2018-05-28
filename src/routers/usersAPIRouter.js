'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../base_modules/tools'

/** 项目模块 */
import * as userAPICtrl from '../controllers/usersAPICtrl'



const apiRouter = new Router({
  prefix: CONFIG.apiServer.prefix
})

apiRouter.get('/auth/users/do/list'
  , userAPICtrl.listUsers
)

apiRouter.get('/auth/users/:targetId/do/get'
  , userAPICtrl.getUser
)

apiRouter.post('/auth/users/do/add'
  , userAPICtrl.addUser
)

apiRouter.post('/auth/users/:targetId/do/modify'
  , userAPICtrl.modifyUser
)

apiRouter.get('/auth/users/:targetId/do/delete'
  , userAPICtrl.deleteUser
)

export default apiRouter
