/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-24 13:55:17
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */

/**
 * @apiDefine Index 默认
 */
router.get('/index', async ctx => {
  ctx.body = [
    {
      name: 'sdw',
      gender: '2',
    },
    {
      name: '2rsa',
      gender: '1',
    },
  ]
})
