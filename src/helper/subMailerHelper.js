/*
 * @Author: helibin@139.com
 * @Date: 2018-08-02 21:26:59
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-02 23:19:07
 */
/** 内建模块 */

/** 第三方模块 */
import axios from 'axios';

/** 基础模块 */
import CONFIG from 'config';
import t from './tools';

/** 项目模块 */

/** 预处理 */


export default class {
  constructor(ctx) {
    this.ctx = ctx;
    this.ret = t.initRet();
  }

  async sendMail(to = 'helibin@139.com', project = 'Ot1HX3') {
    const now = parseInt(Date.now(), 10);
    try {
      const opt = {
        to,
        project,
        appid    : CONFIG.subMailServer.mail.appId,
        signature: CONFIG.subMailServer.mail.appKey,
      };
      const res = await axios.post(CONFIG.subMailServer.mail.host, opt);
      return res.data;
    } catch (ex) {
      this.ctx.state.logger(ex, ex);
      throw ex;
    } finally {
      this.ctx.state.logger('info', `发送邮件用时：${Date.now() - now}ms`);
    }
  }
}
