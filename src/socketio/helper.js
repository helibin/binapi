/*
 * @Author: helibin@139.com
 * @Date: 2018-08-20 15:53:41
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-22 20:13:06
 */
/** 内建模块 */

/** 第三方模块 */
import IO      from 'socket.io';
import Promise from 'bluebird';
import redis   from 'redis';
import ioRedis from 'socket.io-redis';

/** 基础模块 */
import CONFIG     from 'config';
import { logger } from '../helper';

/** 项目模块 */
import ioEvent from './event';


export default class {
  constructor(server, options = {}) {
    this.server  = server;
    this.options = {
      path        : '/socket.io',
      serveClient : false,
      // below are engine.IO options)
      pingInterval: 10000,
      pingTimeout : 5000,
      cookie      : false,
      messages    : [{ namespace: '/test'  }, { namespace: '/test1'  }],
    };
    this.io      = new IO(server, options);
    this.events = {};

    const dbConf = CONFIG.dbServer.socketIO;
    const pub = redis.createClient(dbConf.port, dbConf.host, { auth_pass: dbConf.password }).on('error', ex => ex);
    const sub = redis.createClient(dbConf.port, dbConf.host, { auth_pass: dbConf.password }).on('error', ex => ex);
    this.io.adapter(ioRedis({ pubClient: pub, subClient: sub })).on('error', ex => ex);
  }

  async init() {
    for (const m of this.options.messages) {
      const io = m.namespace ? this.io.of(m.namespace) : this.io;
      io.on('connection', async (socket) => {
        // socket Promise化
        Promise.promisifyAll(socket);

        await this.join(socket, socket.nsp.name);
        await this.listen(socket);
      });

      this.io.on('error', (err) => {
        logger('error', 'socketIO连接出现异常：', err);
      });
    }
  }

  async listen(socket) {
    for (const r in ioEvent) {
      if (!{}.hasOwnProperty.call(ioEvent, r)) continue;


      socket.on(r, async (data) => {
        try {
          const mids = [];
          for (const mid of ioEvent[r]) {
            if (typeof mid === 'function') {
              mids.push(mid(socket, data));
            }
          }
          await Promise.all(mids);
        } catch (ex) {
          socket.emit('err', ex);
        }
      });
    }
  }

  async emit(socket, event, data) {
    // return new Promise((resolve, reject) => socket.emit(event, data, () => {
    //   resolve();
    // }));
  }

  async join(socket, room) {
    await socket.joinAsync(room);
    console.log(`someone joined ${room}`, ',,,');
  }

  async leave(socket, room) {
    socket.leave(room);
  }
}
