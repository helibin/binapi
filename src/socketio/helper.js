/*
 * @Author: helibin@139.com
 * @Date: 2018-08-20 15:53:41
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-08-11 15:07:32
 */
/** 内建模块 */

/** 第三方模块 */
import IO from 'socket.io'
import Promise from 'bluebird'
import redis from 'redis'
import ioRedis from 'socket.io-redis'

/** 基础模块 */
import { CONFIG, Log, ce } from '../helper'

/** 项目模块 */
import ioEvent from './event'

export default class {
  constructor(app, options = {}) {
    this.app = app
    this.options = {
      path: '/socket.io',
      serveClient: false,
      // below are engine.IO options)
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      namespaces: [{ name: '/test' }, { name: '/test1' }],
    }
    this.io = new IO(app, options)
    this.events = {}

    const dbConf = CONFIG.dbServer.socketIO
    const pub = redis.createClient(dbConf.port, dbConf.host, { auth_pass: dbConf.password }).on('error', ex => ex)
    const sub = redis.createClient(dbConf.port, dbConf.host, { auth_pass: dbConf.password }).on('error', ex => ex)
    this.io.adapter(ioRedis({ pubClient: pub, subClient: sub })).on('error', ex => ex)
  }

  async init() {
    const funcs = []
    for (const n of this.options.namespaces) {
      const io = n.name ? this.io.of(n.name) : this.io
      io.on('connection', async socket => {
        // socket Promise化
        Promise.promisifyAll(socket)

        funcs.push(this.join(socket, socket.nsp.name))
        funcs.push(this.listen(socket))
      })

      this.io.on('error', err => {
        Log.logger('error', 'socketIO连接出现异常：', err)
      })
    }
    Promise.all(funcs)
  }

  async listen(socket) {
    // socket事件处理函数
    const routerHandler = (r, s) => async data => {
      try {
        const mids = []
        for (const mid of ioEvent[r]) {
          if (typeof mid === 'function') {
            mids.push(mid(s, data))
          }
        }
        await Promise.all(mids)
      } catch (ex) {
        Log.logger(ex, 'socket.io请求出现异常：', ex)
        s.emit('err', new ce('eSocketIO', ex.message, { data }))
      }
    }

    for (const r in ioEvent) {
      if (!Object.keys(ioEvent).includes(r)) continue

      socket.on(r, routerHandler(r, socket))
    }
  }

  async emit(socket, event, data) {
    socket.emit(event, data)
  }

  async join(socket, room) {
    await socket.joinAsync(room)
    console.log(`someone joined ${room}`, ',,,')
  }

  async leave(socket, room) {
    socket.leave(room)
  }
}
