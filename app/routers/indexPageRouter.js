'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */

/** 项目模块 */
import * as indexPageCtrl from '../controllers/indexPageCtrl'



const router = new Router()

router.get('/',
  async(ctx) => {
    ctx.state.redirect('/index')
  },
)

router.get('/index',
  indexPageCtrl.index,
)

router.get('/test-logger',
  indexPageCtrl.testLogger,
)

router.get('/debug-test',
  indexPageCtrl.debugTest,
)

export default router
