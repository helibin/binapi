/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 10:15:46
 */
/** 内建模块 */
import path from 'path';
import util from 'util';

/** 第三方模块 */
import CONFIG from 'config';
import uuid from 'uuid';
import crypto from 'crypto';
// import unzip   from 'unzip';
// import zlib    from 'zlib';
import maxmind from 'maxmind';
import axios from 'axios';
import si from 'systeminformation';
import math from 'mathjs';

/** 基础模块 */
import { logger } from './logger';

/** 项目模块 */


const M = {};

/**
 * 初始化响应值
 *
 * @param {int}    err 错误代码
 * @param {string} msg 响应内容
 * @param {object} data 响应数据
 * @returns {object} {err: 0, msg: 'ok'}
 */
M.initRet = (err = 0, msg = 'ok', data) => ({
  err,
  msg,
  data,
});

/**
 * 生成缓存key
 * @param {string} arg1 主题
 * @param {string} arg2..argn 键值
 * @returns {string} cacheStr
 */
M.genCacheKey = (...args) => {
  const topic = args.shift();
  const key = args.join('-');
  return `cache#:topic=${topic}:key=${key}`;
};

/**
 * 生成UUID
 *
 * @returns {string} DE931ECB-E3DD-4A71-ACD1-746CAE6EF75C
 */
M.genUUID36 = () => uuid.v4();

/**
 * 生成UUID v4
 *
 * @returns {string} DE931ECBE3DD4A71ACD1746CAE6EF75C
 */
M.genUUID = () => uuid.v4().replace(/-/g, '');

M.getDateStr = () => {
  let dateStr = '';

  const date = new Date();
  dateStr += date.getFullYear(); // 获取完整的年份(4位,1970-????)
  dateStr += (date.getMonth() + 1).toString().padStart(2, '0'); // 获取当前月份(01-12)
  dateStr += date.getDate().toString().padStart(2, '0'); // 获取当前日(01-31)
  dateStr += date.getHours().toString().padStart(2, '0'); // 获取当前小时数(0-23)
  dateStr += date.getMinutes().toString().padStart(2, '0'); // 获取当前分钟数(0-59)
  dateStr += date.getSeconds().toString().padStart(2, '0'); // 获取当前秒数(0-59)

  return dateStr;
};

M.isEmpty = (d) => {
  if (util.isNullOrUndefined(d)) return true;
  if (util.isBoolean(d)) return false;
  if (util.isString(d)) return !d.length;
  if (util.isArray(d)) return !d.length;
  if (util.isObject(d)) return !Object.keys(d).length;

  return !d;
};
/**
 * 生成随机字符串
 *
 * @param {int} len 长度。默认32位
 * @param {string} chars 随机字符可选内容。默认大小写英文和数字
 *
 * @returns {string} randStr
 */
M.genRandStr =  (len = 32,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') => {
  console.time('str');
  let randStr = '';
  while (randStr.length < len) {
    const randIndex = Math.floor(Math.random() * chars.length);
    randStr += chars[randIndex];
  }
  console.timeEnd('str');

  return randStr;
};

/**
 *生成分页信息
 *
 * @param {object} ctx 原始响应对象
 * @param {*} dataList 数据
 * @param {number} [page=1] 页号
 * @param {*} [pageSize=ctx.state.pageSetting.pageSize] 分页大小
 * @returns {object} data 分页数据
 */
M.genPageInfo =  (ctx, dataList, page = 1, pageSize = ctx.state.pageSetting.pageSize) => {
  const data = {};

  data.list = dataList.splice((page - 1) * pageSize, pageSize);
  data.pageInfo = {
    count     : dataList.length,
    page,
    pageSize,
    totalPages: Math.ceil(dataList.length / pageSize),
  };

  return data;
};

/**
 * 从JSON对象中根据路径查找数据
 *
 * @param {object} j 待查找的JSON对象
 * @param {string} pathString 路径，如`user.id`
 * @param {boolean} safeTrace 是否适用安全模式。使用安全模式时，无法找到路径时返回`null`而不会抛错
 * @returns {string} field
*/
M.jsonFind = (j, pathString, safeTrace) => {
  if (j === null || typeof j === 'undefined') {
    if (safeTrace) {
      return null;
    }

    throw new Error('jsonFind() - hit `null`');
  }

  if (pathString === null) {
    if (safeTrace) {
      return null;
    }

    throw new Error('jsonFind() - `null` pathString');
  }

  let currPath = '<TOP>';
  let subJ = j;
  const steps = pathString.split('.');
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    currPath = [currPath, step].join('.');

    if (typeof subJ === 'undefined') {
      if (safeTrace) {
        return null;
      }

      throw new Error(`jsonFind() - hit \`undefined\` at \`${currPath}\``);
    }

    subJ = subJ[step];
  }

  return subJ;
};

/**
 * MD5加密
 * @param {string} str md5加密字符串
 * @returns {string} md5 str
 */
M.getMd5 =  str => crypto.createHash('md5').update(str).digest('hex');

/**
 * sha1加密
 * @param {string} str sha1加密字符串
 * @returns {string} sha1 str
 */
M.getSha1 =  str => crypto.createHash('sha1').update(str).digest('hex');

/**
 * 获取HMAC-SHA1值
 *
 * @param {string} str 待获取HMAC-SHA1值的字符串
 * @param {string} key 密钥
 * @param {string} output 输出格式(hex|base64)
 * @returns {string} hmac-sha1 str
 */
M.getHmacSha1 =  (str, key, output) => {
  const c = crypto.createHash('sha1', key).update(str);

  if (output === 'base64') {
    return c.digest().toString('base64');
  }
  return c.digest('hex');
};

/**
 * 获取加盐加密字符串
 * @param {string} md5Str md5字符串
 * @param {string} secret 加密密钥
 * @param {string} salt 盐
 * @returns {string} salted hash str
 */
M.getSaltedHashStr =  (md5Str, secret, salt = CONFIG.webServer.secret) => {
  const strToHash = `@${md5Str}@${secret}@${salt}@`;

  return M.getSha1(strToHash);
};

/**
 * 获取IP信息
 * http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz
 *
 * @param {*} ip ip地址
 * @returns {object} ipInfo
 */
M.getIPInfo = async (ip) => {
  try {
    return new Promise((resolve, reject) => {
      maxmind.open(path.join(__dirname, '../database/GeoLite2-City.mmdb'), (err, cityLookup) => {
        if (err) return reject(err);

        const ipInfo = cityLookup.get(ip);
        return resolve(ipInfo);
      });
    });
  } catch (ex) {
    logger(ex, 'getIPInfo', ex);
    Promise.reject(ex);
  }
};


/**
 * 通过IP获取位置
 *
 * @param {string} ip ip地址
 * @param {string} [locale='zh-CN'] 语言区域
 * @returns {object} location
 */
M.getLocationByIP = async (ip, locale = 'zh-CN') => {
  const ipInfo = await M.getIPInfo(ip);

  let location = null;
  if (ipInfo) {
    const country = ipInfo.country || { names: {} };
    const province = ipInfo.subdivisions[0] || { names: {} };
    const city = ipInfo.city || { names: {} };
    location = {
      country : country.names[locale],
      province: province.names[locale],
      city    : city.names[locale],
      locale,
    };
  }

  return location;
};

M.getIPInfoByTaobao = async (ip = 'myip') => {
  try {
    const ipInfo = await M.get({ url: CONFIG.openAPI.taobao.ip + ip });
    return ipInfo;
  } catch (ex) {
    logger(ex, 'getIPInfoByTaobao', ex);
    Promise.reject(ex);
  }
};


M.get = async (param) => {
  const ret = M.initRet();

  try {
    const res = await axios.get(param.url);
    ret.data = res.data.data;
    return ret;
  } catch (ex) {
    logger(ex, 'get', ex);
    Promise.reject(ex);
  }
};

/**
 * AES加密
 *
 * @param {string} rawText 待加密内容
 * @param {string} [key=CONFIG.AES.key] key
 * @param {string} [iv=CONFIG.AES.iv] iv
 * @returns {string} base64 str
 */
M.encryptoByAES = (rawText, key = CONFIG.AES.key, iv = CONFIG.AES.iv) => {
  try {
    const c = crypto.createCipheriv('aes-256-cbc', key, iv);
    const chunks = [
      c.update(rawText, 'binary', 'base64'),
      c.final('base64'),
    ];
    return chunks.join('');
  } catch (ex) {
    logger.error(ex, ex);
    return null;
  }
};

/**
 * AES解密
 *
 * @param {string} base64Output 待解密内容
 * @param {string} [key=CONFIG.AES.key] key
 * @param {string} [iv=CONFIG.AES.iv] iv
 * @returns {string} text str
 */
M.decryptoByAES = (base64Output, key = CONFIG.AES.key, iv = CONFIG.AES.iv) => {
  try {
    const c = crypto.createDecipheriv('aes-256-cbc', key, iv);
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
 * @returns {object}
 *  { platform: 'darwin',
 *    distro: 'Mac OS X',
 *    release: '10.13.2',
 *    codename: '',
 *    kernel: '17.3.0',
 *    arch: 'x64',
 *    hostname: 'Ly***al',
 *    logofile: 'ap***le' }
 */
M.getOSInfo = async () => {
  await si.osInfo();
};

/**
 * 获取系统信息
 *
 * @return {object}
 *  { manufacturer: 'Ap***c.',
 *    model: 'Ma***,2',
 *    version: '1.0',
 *    serial: 'C0***2L',
 *    uuid: 'E8***E8',
 *    sku: 'Ma***21' }
 */
M.getSystem = async () => {
  await si.system();
};

/**
 * 数字运算
 *
 * @param {string} execStr 运算字符串
 * @return {int} exec result
 */
M.eval = (execStr) => {
  math.config({
    number   : 'BigNumber', // Default type of number:
    // 'number' (default), 'BigNumber', or 'Fraction'
    precision: 20, // Number of significant digits for BigNumbers
  });

  const unformatVal = math.eval(execStr);

  return Number(math.format(unformatVal));
};

/**
 * 对象排序
 *
 * @param {object} obj 运算字符串
 * @return {object} data
 */
M.sortObj = (obj) => {
  const keys = Object.keys(obj).sort();

  const r = {};
  for (const d of keys) {
    r[d] = obj[d];
  }

  return r;
};

export default M;
