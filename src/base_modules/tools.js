'use strict'

/** 内建模块 */
import path from 'path'

/** 第三方模块 */
import uuid from 'uuid'
import crypto from 'crypto'
import unzip from 'unzip'
import zlib from 'zlib'
import maxmind from 'maxmind'
import axios from 'axios'

/** 基础模块 */
import CONFIG from 'config'
import {
  promise
} from 'when';

/** 项目模块 */



let t = module.exports = {};

t.genUUID36 = () => {
  let id36 = uuid.v4()
  return id36;
}

t.genUUID = () => uuid.v4().replace(/-/g, '')


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
t.genRandStr = (len = 32,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') => {

  let randStr = '';
  while (randStr.length < len) {
    let randIndex = Math.floor(Math.random() * chars.length);
    randStr += chars[randIndex];
  }

  return randStr;
}

/**
 * 初始化返回值
 */
t.initRet = () => {
  return {
    err: 0,
    msg: ''
  }
}

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
t.genPageInfo = (ctx, dataList, page = 1, pageSize = ctx.state.pageSetting.pageSize) => {
  let data = {}

  data.pageInfo = {
    count: dataList.length,
    pageNumber: page,
    pageSize: pageSize,
    totalPages: Math.ceil(dataList.length / pageSize),
  }
  data.list = dataList.splice((page - 1) * pageSize, pageSize)

  return data;
}

/**
 * MD5加密
 */
t.getMd5 = (str) => crypto.createHash('md5').update(str).digest('hex')

/**
 * sha1加密
 */
t.getSha1 = (str) => crypto.createHash('sha1').update(str).digest('hex')

/**
 * 获取HMAC-SHA1值
 *
 * 参数
  str <string> 待获取HMAC-SHA1值的字符串
  key <string> 密钥
  output <string> 输出格式。`base64`或`hex`，默认`hex`
 */
t.getHmacSha1 = (str, key, output) => {
  let c = crypto.createHash('sha1', key).update(str)

  if (output == 'base64') {
    return c.digest().toString('base64')
  } else {
    return c.digest('hex')
  }
}

/**
 *
 * @param {string} md5(password)
 * @param {string} secret
 * @param {string} salt
 */
t.getSaltedPasswordHash = (md5password, secret = ctx.state.userId, salt = CONFIG.webServer.salt) => {
  let strToHash = `@${md5password}@${secret}@${salt}@`

  return getSha1(strToHash)
}

t.getLocation = (ctx) => {
  maxmind.open(path.join(__dirname, '../databases/GeoLite2-City.mmdb'), (err, cityLookup) => {
    if (err) {
      ctx.state.logger('error', 'getLocation', err);
      return null;
    }
    return cityLookup.get(ctx.ip);
  });
}
t.getIPInfo = async (ctx, ip = 'myip') => {
  try {
    let ipInfo = await t.get(ctx, {
      url: 'http://ip.taobao.com/service/getIpInfo2.php?ip=' + ip
    })
    return ipInfo
  } catch (e) {
    ctx.state.logger('error', e, ',,,');
  }
}

t.post = async () => {

}
t.get = async (ctx, param) => {
  try {
    let res = await axios.get(param.url)
    return res.data.data
  } catch (e) {
    ctx.state.logger('debug', e, ',,,');
  }
}
