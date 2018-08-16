/*
 * @Author: helibin@139.com
 * @Date: 2018-08-06 14:25:59
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-16 16:26:27
 */
/** 内建模块 */

/** 第三方模块 */
import axios from 'axios';

/** 基础模块 */

/** 项目模块 */

/** 预处理 */


export default class {
  constructor(ctx) {
    this.ctx   = ctx;
    this.axios = axios;

    axios.interceptors.request.use(conf => conf, err => Promise.reject(err));
    axios.interceptors.response.use(res => res.data, err => Promise.reject(err));
    axios.defaults.timeout = 10000;
    axios.defaults.headers = { 'x-auth-token': ctx.state.xAuthToken || '' };
  }

  async run(func, ...args) {
    try {
      await this[func](...args);
    } catch (ex) {
      this.ctx.state.logger(ex, `执行${func}时发生异常`);
    }
  }

  async post(url, options) {
    return await this.axios.post(url, options);
  }
}
