/*
 * @Author: helibin@139.com
 * @Date: 2018-08-08 21:55:49
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-15 13:20:04
 */
/** 内建模块 */

/** 第三方模块 */
import ALY     from 'aliyun-sdk';
import Promise from 'bluebird';
import chalk   from 'chalk';

/** 基础模块 */
import CONFIG     from 'config';
import _e         from './customError';
import { logger } from './logger';
import t          from './tools';

/** 项目模块 */

/** 预处理 */
// 创建aly产品客户端
const alyClient  = (type = 'common') => {
  try {
    return new ALY[type.toUpperCase()]({
      accessKeyId    : CONFIG.alyServer[type].accessKeyId || CONFIG.alyServer.accessKeyId,
      secretAccessKey: CONFIG.alyServer[type].accessKeySecret || CONFIG.alyServer.accessKeySecret,
      endpoint       : CONFIG.alyServer[type].endpoint,
      apiVersion     : CONFIG.alyServer[type].apiVersion,
    });
  } catch (ex) {
    logger(ex, '初始化阿里云客户端失败：', JSON.stringify(ex));
    throw ex;
  }
};

// 缓存
const cache = { oss: {} };


export default class {
  constructor(ctx) {
    this.ctx = ctx;
    this.client = alyClient;
    this.ret = t.initRet();
  }

  async upload(ossPath, file) {
    return new Promise((resolve, reject) => {
      if (file.length === 0) {
        return resolve(this.ret);
      }

      const opt = {
        Bucket                  : CONFIG.alyServer.oss.bucketName,
        Key                     : ossPath,
        Body                    : file,
        AccessControlAllowOrigin: '',
        ContentType             : 'text/plain',
        CacheControl            : 'no-cache',
        ContentDisposition      : '',
        ContentEncoding         : 'utf-8',
        ServerSideEncryption    : 'AES256',
      };


      this.client('oss').putObject(opt, (err) => {
        this.ctx.state.logger(err, `${chalk.blue('[OSS]')} 文件上传至\`${ossPath}\``);
        if (err) reject(new _e('EAliyunAPI', 'ossUploadFailed', err));

        if (CONFIG.alyServer.oss.cacheExpire) {
          // 上传成功后，清理缓存
          delete cache.oss[ossPath];
        }

        return resolve(this.ret);
      });
    });
  }

  async download(ossPath) {
    return new Promise((resolve, reject) => {
      console.log(CONFIG.alyServer.oss.cacheExpire, cache.oss, ',,,');
      if (CONFIG.alyServer.oss.cacheExpire && cache.oss[ossPath]) {
        this.ctx.state.logger(null, `${chalk.blue('[OSS]')} 从\`${ossPath}\`缓存下载文件`);

        this.ret.msg = 'okFromCache';
        this.ret.data = cache.oss[ossPath];
        return resolve(this.ret);
      }

      const opt = {
        Bucket: CONFIG.alyServer.oss.bucketName,
        Key   : ossPath,
      };

      this.client('oss').getObject(opt, (err, ossRes) => {
        this.ctx.state.logger(err, `${chalk.blue('[OSS]')} 从\`${ossPath}\`下载文件`);
        if (err) reject(new _e('EAliyunAPI', 'ossDownloadFailed', err));

        if (CONFIG.alyServer.oss.cacheExpire && ossRes) {
          // 首次下载后，缓存在Web服务器
          cache.oss[ossPath] = ossRes.Body;

          // 缓存自动销毁
          setTimeout(() => {
            delete cache.oss[ossPath];
          }, CONFIG.alyServer.oss.cacheExpire * 1000);
        }

        this.ret.data = ossRes.Body;
        return resolve(this.ret);
      });
    });
  }
}


// /** ***** yqBridge ***** */


// AlyHelper.prototype.genAlyCoupon = function (uid, activityCode, callback) {
//   const self = this;
//   const ret = toolkit.initRet();

//   const opt = {
//     Uid         : uid,
//     FromAppName : 'cloud-sandbox',
//     ActivityCode: activityCode,
//   };
//   self.alyClient.lotteryDraw(opt, (err, alyRes) => {
//     self.res.locals.logger(err, toolkit.strf(`${colors.blue('[yqBridge]')}为用户{0}生成代金券`, uid));
//     if (err) {
//       return callback(new _e('EAliyunAPI', 'obtainCouponFailed', {
//         statusCode: err.statusCode,
//         code      : err.code,
//         message   : err.message,
//         requestid : err.requestid,
//       }));
//     }

//     ret.data   = alyRes.data || alyRes;

//     return callback(null, ret);
//   });
// };


// /** ***** aas ***** */


// AlyHelper.prototype.getSessionInfoByTicket = function (alyTicket, callback) {
//   const self  = this;
//   const opt = { Ticket: alyTicket  };
//   self.alyClient.getSessionInfoByTicket(opt, (err, alyRes) => {
//     self.res.locals.logger(err, toolkit.strf(`${colors.blue('[ass]')}获取阿里用户信息`));
//     if (err) return callback(new _e('EAliyunAPI', err.code || err.Code, err));

//     return callback(null, alyRes);
//   });
// };
