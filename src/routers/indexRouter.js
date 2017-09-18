'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */

/** 项目模块 */
import indexCtrl from '../controllers/indexCtrl'



const router = new Router()
const apiRouter = new Router({
  prefix: '/api'
})

router.get('/test-logger'
  , indexCtrl.testLogger
)
router.get('/',
  indexCtrl.index
)

export default router
