/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-06 11:25:32
 */
/** 内建模块 */
import { isNullOrUndefined } from 'util';

/** 第三方模块 */
import chalk      from 'chalk';
import sortedJSON from 'sorted-json';
import Promise    from 'bluebird';
import redis      from 'redis';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */
import { logger } from './logger';

/** 预处理 */
Promise.promisifyAll(redis);

const redisConf = CONFIG.dbServer.redis;
const redisClientOpt = {};
for (const k in redisConf) {
  if (!isNullOrUndefined(redisConf[k])) {
    redisClientOpt[k] = redisConf[k];
  }
}
const client = redis.createClient(redisClientOpt);
client.on('error', ex => ex);

// 测试db连接
client.authAsync(redisClientOpt.password).then((res) => {
  logger('debug', `Redis连接成功！${res}`);
}).catch((ex) => {
  logger('error', `无法连接至Redis数据库：${ex}`);
});

export default class {
  constructor(ctx) {
    this.ctx   = ctx;
    this.client = client;
  }

  async run(...args) {
    try {
      const command = args.shift();

      this.ctx.state.logger('debug',
        `${chalk.magenta('[REDIS]')} \`${chalk.yellow(command.toUpperCase())}\` <- `,
        JSON.stringify(args.toString()));

      return await this.client[`${command}Async`](...args);
    } catch (ex) {
      this.ctx.state.logger(ex, `运行Redis任务错误：${ex}`);
      throw ex;
    }
  }

  async addTask(queueName, task, delay = 0) {
    const timestamp = parseInt(Date.now() / 1000 + delay, 10);

    await this.run('zadd',
      queueName,
      timestamp,
      sortedJSON.stringify(task));
  }

  async list(patten) {
    return await this.run('keys', patten);
  }

  async get(key) {
    return await this.run('get', key);
  }

  async set(key, value, expiredTime) {
    const args = [key, value];
    if (expiredTime) args.push('ex', expiredTime);
    return await this.run('set', ...args);
  }

  async del(patten) {
    this.ctx.state.logger('debug', `${chalk.magenta('[REDIS]')} 按模式 ${patten} 批量删除`);

    const keys = await this.run('keys', patten);

    if (keys && keys.length) {
      return await this.run('del', keys);
    }
  }
}
