/** 内建模块 */
import path from 'path';

/** 第三方模块 */
import uuid from 'uuid';
import crypto from 'crypto';
// import unzip from 'unzip';
// import zlib from 'zlib';
import maxmind from 'maxmind';
import axios from 'axios';
import si from 'systeminformation';
import math from 'mathjs';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */


const Tools = {};

/**
 * 初始化返回值
 */
Tools.initRet = () => ({
  err: 0,
  msg: '',
});

/**
 * 生成UUID
 *
 * 返回
 *   <string> DE931ECB-E3DD-4A71-ACD1-746CAE6EF75C
 */
Tools.genUUID36 = () => uuid.v4();

/**
 * 生成UUID v4
 *
 * 返回
 *   <string> DE931ECBE3DD4A71ACD1746CAE6EF75C
 */
Tools.genUUID = () => uuid.v4().replace(/-/g, '');

/**
 * 生成随机字符串
 *
 * 参数
 *   len <integer> 长度。默认32位
 *   chars <string> 随机字符可选内容。默认大小写英文和数字
 *
 * 返回
 *   <string>
 */
Tools.genRandStr = (len = 32,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') => {
  let randStr = '';
  while (randStr.length < len) {
    const randIndex = Math.floor(Math.random() * chars.length);
    randStr += chars[randIndex];
  }

  return randStr;
};

/**
生成分页信息
!!重要 需要与`detectPageSetting`配合使用

参数
  ctx <object> 原始响应对象
  result <JSON> mysql查询结果

返回
  <JSON> 详细如下：
    {
      "pageNumber"  : <页号>,
      "pageSize"    : <分页大小>,
      "pageCount"   : <分页数量>
      "currentCount": <本页记录数>,
      "totalCount"  : <所有记录数>,
    }
*/
Tools.genPageInfo = (ctx, dataList, page = 1, pageSize = ctx.state.pageSetting.pageSize) => {
  const data = {};

  data.pageInfo = {
    count: dataList.length,
    pageNumber: page,
    pageSize,
    totalPages: Math.ceil(dataList.length / pageSize),
  };
  data.list = dataList.splice((page - 1) * pageSize, pageSize);

  return data;
};

/**
 * MD5加密
 */
Tools.getMd5 = str => crypto.createHash('md5').update(str).digest('hex');

/**
 * sha1加密
 */
Tools.getSha1 = str => crypto.createHash('sha1').update(str).digest('hex');

/**
 * 获取HMAC-SHA1值
 *
 * 参数
  str <string> 待获取HMAC-SHA1值的字符串
  key <string> 密钥
  output <string> 输出格式。`base64`或`hex`，默认`hex`
 */
Tools.getHmacSha1 = (str, key, output) => {
  const c = crypto.createHash('sha1', key).update(str);

  if (output == 'base64') {
    return c.digest().toString('base64');
  }
  return c.digest('hex');
};

/**
 *
 * @param {string} md5(password)
 * @param {string} secret
 * @param {string} salt
 */
Tools.getSaltedPasswordHash = (md5password, secret = ctx.state.userId, salt = CONFIG.webServer.salt) => {
  const strToHash = `@${md5password}@${secret}@${salt}@`;

  return getSha1(strToHash);
};

/**
 * 获取IP信息
 * http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz
 *
 * @param {*} ctx
 * @param {*} ip
 */
Tools.getIPInfo = (ctx, ip) => {
  try {
    return new Promise((resolve, reject) => {
      maxmind.open(path.join(__dirname, '../databases/GeoLite2-City.mmdb'), (err, cityLookup) => {
        if (err) return reject(err);

        const ipInfo = cityLookup.get(ip || ctx.ip);
        return resolve(ipInfo);
      });
    });
  } catch (e) {
    ctx.state.logger('error', 'Tools.getIPInfo', e);
    return null;
  }
};

Tools.getLocationByIP = async (ctx, ip) => {
  const ipInfo = await Tools.getIPInfo(ctx, ip);

  let location = null;
  const locale = ctx.state.locale;
  if (ipInfo) {
    const country = ipInfo.country || {
      names: {},
    };
    const province = ipInfo.subdivisions[0] || {
      names: {},
    };
    const city = ipInfo.city || {
      names: {},
    };
    location = {
      country: country.names[locale],
      province: province.names[locale],
      city: city.names[locale],
      locale,
    };
  }

  return location;
};

Tools.getIPInfoByTaobao = async (ctx, ip = 'myip') => {
  try {
    const ipInfo = await Tools.get(ctx, {
      url: CONFIG.openAPI.taobao.ip + ip,
    });
    return ipInfo;
  } catch (e) {
    ctx.state.logger('error', e, ',,,');
  }
};

Tools.post = async () => {

};
Tools.get = async (ctx, param) => {
  try {
    const res = await axios.get(param.url);
    return res.data.data;
  } catch (e) {
    ctx.state.logger('debug', e, ',,,');
  }
};


/**
获取HMAC-SHA1值

参数
  str <string> 待获取HMAC-SHA1值的字符串
  key <string> 密钥
  output <string> 输出格式。`base64`或`hex`，默认`hex`

返回
  <string>
*/
exports.getHmacSha1 = function getHmacSha1(str, key, output) {
  const c = crypto.createHmac('sha1', key);
  c.update(str);

  let hmacSha1 = null;
  if (output === 'base64') {
    hmacSha1 = c.digest().toString('base64');
  } else {
    hmacSha1 = c.digest('hex');
  }

  return hmacSha1;
};

/**
AES加密

参数
  rawText <string> 待加密内容

返回
  <string>
*/
Tools.cipherByAES = (rawText) => {
  try {
    const c = crypto.createCipheriv('aes-256-cbc', CONFIG.AES.key, CONFIG.AES.iv);
    const chunks = [
      c.update(rawText, 'binary', 'base64'),
      c.final('base64'),
    ];
    return chunks.join('');
  } catch (ex) {
    return null;
  }
};

/**
AES解密

参数
  input <string> 待解密内容

返回
  <string>
*/
Tools.decipherByAES = (base64Output) => {
  try {
    const c = crypto.createDecipheriv('aes-256-cbc', CONFIG.AES.key, CONFIG.AES.iv);
    const chunks = [
      c.update(base64Output, 'base64', 'binary'),
      c.final('binary'),
    ];
    return chunks.join('');
  } catch (ex) {
    return null;
  }
};

/**
 * 获取操作系统信息
 *
 * @param {*} ctx
 * @returns
 *  { platform: 'darwin',
 *    distro: 'Mac OS X',
 *    release: '10.13.2',
 *    codename: '',
 *    kernel: '17.3.0',
 *    arch: 'x64',
 *    hostname: 'Ly***al',
 *    logofile: 'ap***le' }
 */
Tools.getOSInfo = async () => {
  await si.osInfo();
};

/**
 * 获取系统信息
 *
 * @param {*} ctx
 * @return
 *  { manufacturer: 'Ap***c.',
 *    model: 'Ma***,2',
 *    version: '1.0',
 *    serial: 'C0***2L',
 *    uuid: 'E8***E8',
 *    sku: 'Ma***21' }
 */
Tools.getSystem = async () => await si.system();

/**
 * 数字运算
 *
 * @param {*} execStr
 * @return number
 */
Tools.eval = (execStr) => {
  math.config({
    number: 'BigNumber', // Default type of number:
    // 'number' (default), 'BigNumber', or 'Fraction'
    precision: 20, // Number of significant digits for BigNumbers
  });

  const unformatVal = math.eval(execStr);

  return Number(math.format(unformatVal));
};

export default Tools;
