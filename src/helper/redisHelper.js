/** 内建模块 */
import util from 'util';

/** 第三方模块 */
import redis from 'redis';
import chalk from 'chalk';

/** 基础模块 */
import CONFIG from 'config';
import t from './tools';

/** 项目模块 */

const redisConf = CONFIG.dbServer.redis;
const redisClientOpt = {};
for (const k in redisConf) {
  if (!util.isNullOrUndefined(redisClientOpt[k])) {
    redisClientOpt[k] = redisConf[k];
  }
}

export default class {
  constructor(ctx) {
    this.ctx = ctx;
    this.redisClient = redis.createClient(redisClientOpt);
  }

  run(...args) {
    const command = args.shift();

    this.ctx.state.logger('debug',
      `${chalk.magenta('[REDIS]')} <-
      ${chalk.yellow(command.toUpperCase())}
      ${JSON.stringify(args)}`);

    this.redisClient(...args);
  }

  delByPatten(patten) {
    this.ctx.logger('debug', `${chalk.magenta('[REDIS]')} 按模式 ${patten} 批量删除`);
  }
}
