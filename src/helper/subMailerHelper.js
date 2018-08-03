/*
 * @Author: helibin@139.com
 * @Date: 2018-08-02 21:26:59
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-03 16:17:50
 */
/** 内建模块 */

/** 第三方模块 */
import axios from 'axios';

/** 基础模块 */
import CONFIG from 'config';
import t from './tools';
import { _e } from '.';

/** 项目模块 */

/** 预处理 */


export default class {
  constructor(ctx) {
    this.ctx = ctx;
    this.ret = t.initRet();
  }

  async sendMail(to = 'helibin@139.com', project = 'Ot1HX3') {
    const now = parseInt(Date.now(), 10);
    const opt = {
      to,
      project,
      appid    : CONFIG.subMailServer.mail.appId,
      signature: CONFIG.subMailServer.mail.appKey,
    };
    try {
      const res = await axios.post(CONFIG.subMailServer.mail.host, opt);
      return res.data;
    } catch (ex) {
      this.ctx.state.logger(ex, ex, opt);
      throw ex;
    } finally {
      this.ctx.state.logger('info', `发送邮件用时：${Date.now() - now}ms`);
    }
  }

  async sendSMS(to = '15179316184', project = 'Dy4dH3', code = t.genRandStr(6, '1234567890')) {
    const now = parseInt(Date.now(), 10);
    const opt = {
      to,
      project,
      vars     : { code },
      appid    : CONFIG.subMailServer.sms.appId,
      signature: CONFIG.subMailServer.sms.appKey,
    };
    try {
      const smsRes = await axios.post(CONFIG.subMailServer.sms.host, opt);
      if (smsRes.data.status === 'error') {
        this.ctx.state.logger('error', '获取赛邮短信异常：', JSON.stringify(smsRes.data));
        throw new _e('ESubMailAPI', smsRes.data.msg);
      }

      return this.ret;
    } catch (ex) {
      this.ctx.state.logger(ex, ex, opt);
      throw ex;
    } finally {
      this.ctx.state.logger('info', `发送短信用时：${Date.now() - now}ms`);
    }
  }
}
