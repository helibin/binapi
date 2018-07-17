/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by:   lybeen
 * @Last Modified time: 2018-07-17 15:55:47
 */
/** 内建模块 */
import { isNullOrUndefined } from 'util';

/** 第三方模块 */
import Promise    from 'bluebird';
import redis      from 'redis';
import chalk      from 'chalk';
import sortedJSON from 'sorted-json';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */

/** 预处理 */
Promise.promisifyAll(redis);


const redisConf = CONFIG.dbServer.redis;
const redisClientOpt = {};
for (const k in redisConf) {
  if (!isNullOrUndefined(redisClientOpt[k])) {
    redisClientOpt[k] = redisConf[k];
  }
}

export default class {
  constructor(ctx) {
    this.ctx = ctx;
    this.redisClient = redis.createClient(redisClientOpt);
  }

  async run(...args) {
    const command = args.shift();

    this.ctx.state.logger('debug',
      `${chalk.magenta('[REDIS]')} \`${chalk.yellow(command.toUpperCase())}\` <- `,
      JSON.stringify(args.toString()));

    return await this.redisClient[`${command}Async`](...args);
  }

  async addTask(queueName, task, delay = 0) {
    const timestamp = parseInt(Date.now() / 1000 + delay, 10);

    await this.run('zadd',
      queueName,
      timestamp,
      sortedJSON.stringify(task));
  }

  async del(patten) {
    this.ctx.state.logger('debug', `${chalk.magenta('[REDIS]')} 按模式 ${patten} 批量删除`);

    const keys = await this.run('keys', patten);

    if (keys && keys.length) {
      return await this.run('del', keys);
    }
  }
}
