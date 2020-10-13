/*
 * @Author: helibin@139.com
 * @Date: 2018-08-22 14:27:31
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-08-11 15:53:00
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { CONFIG, T as t } from '../helper'

/** 项目模块 */
import ioHandler from './handler'

const events = {}
const router = async (event, ...handlers) => {
  event = (CONFIG.socketServer.prefix || '') + event
  if (t.isEmpty(events[event])) {
    events[event] = [ioHandler.requireSign]
  }

  for (const h of handlers) {
    events[event].push(h)
  }
}

router('/test', ioHandler.test, ioHandler.sendOK)

router('/chat', ioHandler.chat)

export default events
