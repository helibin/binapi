'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */

/** 项目模块 */
import indexCtrl from '../controllers/indexCtrl'



const router = new Router()

router.get('/',
  async(ctx) => {
    ctx.state.redirect('/index')
  },
)

router.get('/index',
  indexCtrl.index,
)

router.get('/test-logger',
  indexCtrl.testLogger,
)

router.get('/debug-test',
  indexCtrl.debugTest,
)

export default router
