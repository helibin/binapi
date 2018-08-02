/*
 * @Author: helibin@139.com
 * @Date: 2018-07-31 16:32:39
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-02 22:46:07
 */
/** 内建模块 */

/** 第三方模块 */
import SMS from '@alicloud/sms-sdk';
import day from 'dayjs';

/** 基础模块 */
import chalk from 'chalk';
import CONFIG     from 'config';
import _e         from './serverError';
import t          from './tools';

/** 项目模块 */

/** 预处理 */
const smsConf         = CONFIG.alyServer.sms;
const accessKeyId     = smsConf.accessKeyId;
const secretAccessKey = smsConf.accessKeySecret;
const smsClient       = new SMS({ accessKeyId, secretAccessKey });

export default class {
  constructor(ctx) {
    this.ctx = ctx;
    this.ret = t.initRet();
    this.smsClient = smsClient;
  }

  /**
   * 发送短信
   *
   * @param {*} mobile 大陆手机号码
   * @param {string} [type='default'] 短信验证码类型（signup）
   * @returns {object} ret
   */
  async sendSMS(mobile, type = 'default') {
    const code = t.genRandStr(6, '1234567890');
    const cache = t.genCacheKey('alySMS', mobile, type);
    const retryCacheKey = t.genCacheKey('alySMS@retryTimeout', mobile);

    const smsOpt = {
      PhoneNumbers : mobile,
      TemplateParam: JSON.stringify({ code }),
      SignName     : smsConf.signName,
      TemplateCode : smsConf.template[type],
    };

    try {
      // 查询重试标记
      const retryCacheCheck = await this.ctx.state.redis.get(retryCacheKey);
      if (!t.isEmpty(retryCacheCheck)) {
        throw new _e('EAliyunAPI', 'EClientTooManyRequest');
      }

      const smsRes = await this.smsClient.sendSMS(smsOpt);
      if (smsRes.Code !== 'OK') {
        if (smsRes.code === 'isv.BUSINESS_LIMIT_CONTROL') {
          throw new _e('EAliyunAPI', 'EClientTooManyRequest');
        }

        throw new _e('EAliyunAPI', 'senSMSFailed', smsRes);
      }

      // 设置验证码缓存
      await this.ctx.state.redis.set(cache, code, CONFIG.webServer.smsCodeMaxAge.aly);
      // 设置重试标记
      await this.ctx.state.redis.set(retryCacheKey, `${Date.now()}`, CONFIG.webServer.smsCodRetryTimeout.aly);

      this.ctx.state.logger('debug', chalk.magenta('[ALYSMS]'), `${mobile}获取${type}类型验证码：${code}`);
      return this.ret;
    } catch (ex) {
      this.ctx.state.logger(ex, '获取阿里云短信验证码失败', ex, `参数：${JSON.stringify(smsOpt)}`);
      throw ex;
    }
  }

  /**
   * 查询短信发送详情
   *
   * @param {*} mobile 手机号码
   * @param {string} [sendDate=day().format('YYYYMMDD')] 发送日期
   * @param {number} [pageSize=10] 每页大小
   * @param {number} [page=1] 页数
   * @returns {object} alyRes
   */
  async queryDetail(mobile, sendDate = day().format('YYYYMMDD'), pageSize = 10, page = 1) {
    pageSize = pageSize > 50 ? 50 : pageSize;
    const queryOpt = {
      PhoneNumber: `${mobile}`,
      SendDate   : `${sendDate}`,
      PageSize   : `${pageSize}`,
      CurrentPage: `${page}`,
    };
    try {
      const alyRes = await this.smsClient.queryDetail(queryOpt);
      const { Code, SmsSendDetailDTOs } = alyRes;
      if (Code !== 'OK') { throw new _e('EAliyunAPI', 'querySMSSendDetailFailed', alyRes); }

      this.ctx.state.logger('debug', '查询短信发送详情：', JSON.stringify(alyRes));
      return SmsSendDetailDTOs.SmsSendDetailDTO;
    } catch (ex) {
      this.ctx.state.logger(ex, `查询短信发送详情异常：${ex},`, `参数：${JSON.stringify(queryOpt)}`);
      throw ex;
    }
  }
}
