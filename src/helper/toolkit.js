0
/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-16 17:09:20
 */
/** 内建模块 */
import util from 'util'
import fs from 'fs'

/** 第三方模块 */
import xml2js from 'xml2js'
import CONFIG from 'config'
import crypto from 'crypto'
import * as mathjs from 'mathjs'
import uuid from 'uuid'
import CircularJSON from 'circular-json'

/** 基础模块 */

/** 项目模块 */

/**
 * 初始化响应值
 *
 * @param {object} data 响应数据
 * @param {string} msg 响应内容
 * @param {int} code 错误代码
 * @returns {object} {code: 0, msg: 'ok'}
 */
exports.initRet = (data, msg = 'ok', code = 0) => ({
  status: 200,
  code,
  msg,
  data,
})

/**
 * 生成缓存key
 * @param {string} arg1 主题
 * @param {string} arg2..argn 键值
 * @returns {string} cacheStr
 */
exports.genCacheKey = (...args) => {
  const topic = args.shift()
  const key = args.join('-')
  return `cache#:topic=${topic}:key=${key}`
}

/**
 * 生成UUID
 *
 * @returns {string} DE931ECB-E3DD-4A71-ACD1-746CAE6EF75C
 */
exports.genUUID36 = () => uuid.v4()

/**
 * 生成UUID v4
 *
 * @returns {string} DE931ECBE3DD4A71ACD1746CAE6EF75C
 */
exports.genUUID = () => uuid.v4().replace(/-/g, '')

exports.getDateStr = () => {
  let dateStr = ''

  const date = new Date()
  dateStr += date.getFullYear() // 获取完整的年份(4位,1970-????)
  dateStr += `${date.getMonth() + 1}`.padStart(2, 0) // 获取当前月份(01-12)
  dateStr += `${date.getDate()}`.padStart(2, 0) // 获取当前日(01-31)

  return dateStr
}

exports.getTimeStr = (showMS = false) => {
  let dateStr = ''

  const date = new Date()
  dateStr += `${date.getHours()}`.padStart(2, 0) // 获取当前小时数(0-23)
  dateStr += `${date.getMinutes()}`.padStart(2, 0) // 获取当前分钟数(0-59)
  dateStr += `${date.getSeconds()}`.padStart(2, 0) // 获取当前秒数(0-59)
  if (showMS) dateStr += `${date.getMilliseconds()}`.padStart(3, 0)

  return dateStr
}

exports.getDateTimeStr = (showMS = false) => {
  let dateStr = ''

  const date = new Date()
  dateStr += date.getFullYear() // 获取完整的年份(4位,1970-????)
  dateStr += `${date.getMonth() + 1}`.padStart(2, 0) // 获取当前月份(01-12)
  dateStr += `${date.getDate()}`.padStart(2, 0) // 获取当前日(01-31)
  dateStr += `${date.getHours()}`.padStart(2, 0) // 获取当前小时数(0-23)
  dateStr += `${date.getMinutes()}`.padStart(2, 0) // 获取当前分钟数(0-59)
  dateStr += `${date.getSeconds()}`.padStart(2, 0) // 获取当前秒数(0-59)
  if (showMS) dateStr += `${date.getMilliseconds()}`.padStart(3, 0)

  return dateStr
}

exports.isEmpty = d => {
  if (util.isNullOrUndefined(d)) return true
  if (util.isBoolean(d)) return false
  if (util.isString(d)) return !d.length
  if (util.isArray(d)) return !d.length
  if (util.isDate(d)) return false
  if (util.isObject(d)) return !Object.keys(d).length

  return !d
}
/**
 * 生成随机字符串
 *
 * @param {int} len 长度。默认32位
 * @param {string} chars 随机字符可选内容。默认大小写英文和数字
 *
 * @returns {string} randStr
 */
exports.genRandStr = (len = 32, chars = '0123456789abcdefghijklmnopqrstuvwxyz') => {
  let randStr = ''
  while (randStr.length < len) {
    const randIndex = Math.floor(Math.random() * chars.length)
    randStr += chars[randIndex]
  }

  return randStr
}
/**
 * 生成16进制内的随机数字
 */
exports.genRandNum = (len = 16, onlyNum = true) =>
  onlyNum ? exports.genRandStr(len, '0123456789') : exports.genRandStr(len, '0123456789abcdef')

/**
 * 生成指定范围内的数字
 */
exports.genRangeNum = (from, to) => Math.floor(Math.random() * (to - from + 1) + from) * 1 || 0

/**
 *生成分页信息
 *
 * @param {object} ctx 原始响应对象
 * @param {*} dataList 数据
 * @param {number} [page=ctx.state.pageSetting.page] 页号
 * @param {number} [psize=ctx.state.pageSetting.psize] 分页大小
 * @returns {object} data 分页数据
 */
exports.genPageInfo = (ctx, dataList, page = ctx.state.pageSetting.page, psize = ctx.state.pageSetting.psize) => {
  ctx.state.pageInfo = {
    total: dataList.length,
    page,
    psize,
    pages: Math.ceil(dataList.length / psize),
  }

  return dataList.splice((page - 1) * psize, psize)
}

exports.formatPageInfo = (
  ctx,
  total,
  dataList,
  page = ctx.state.pageSetting.page,
  psize = ctx.state.pageSetting.psize,
) => {
  ctx.state.pageInfo = {
    total,
    page,
    psize,
    pages: Math.ceil(total / psize),
  }

  return dataList
}

/**
 * 从JSON对象中根据路径查找数据
 *
 * @param {object} j 待查找的JSON对象
 * @param {string} pathString 路径, 如`user.id`
 * @param {boolean} safeTrace 是否适用安全模式。使用安全模式时, 无法找到路径时返回`null`而不会抛错
 * @returns {string} field
 */
exports.jsonFind = (j, pathString, safeTrace) => {
  if (j === null || typeof j === 'undefined') {
    if (safeTrace) {
      return null
    }

    throw new Error('jsonFind() - hit `null`')
  }

  if (pathString === null) {
    if (safeTrace) {
      return null
    }

    throw new Error('jsonFind() - `null` pathString')
  }

  let currPath = '<TOP>'
  let subJ = j
  const steps = pathString.split('.')
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i]
    currPath = [currPath, step].join('.')

    if (typeof subJ === 'undefined') {
      if (safeTrace) {
        return null
      }

      throw new Error(`jsonFind() - hit \`undefined\` at \`${currPath}\``)
    }

    subJ = subJ[step]
  }

  return subJ
}

/**
 * MD5加密
 * @param {string} str md5加密字符串
 * @returns {string} md5 str
 */
exports.getMd5 = str =>
  crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
    .toUpperCase()

/**
 * sha1加密
 * @param {string} str sha1加密字符串
 * @returns {string} sha1 str
 */
exports.getSha1 = str =>
  crypto
    .createHash('sha1')
    .update(str)
    .digest('hex')
    .toUpperCase()

/**
 * 获取Hash值
 *
 * @param {string} [type=sha1] 待获取hash类型(md5|sha1)
 * @param {string} str 待获取hash值的字符串
 * @param {string} key 密钥
 * @param {string} output 输出格式(hex|base64)
 * @returns {string} hash str
 */
exports.getHash = (type = 'sha1', str) => {
  return crypto
    .createHash(type)
    .update(str)
    .digest('hex')
    .toUpperCase()
}

/**
 * 获取HMAC-SHA1值
 *
 * @param {string} [type=sha1] 待获取HMAC类型(md5|sha1)
 * @param {string} str 待获取HMAC-SHA1值的字符串
 * @param {string} key 密钥
 * @param {string} output 输出格式(hex|base64)
 * @returns {string} hmac-sha1 str
 */
exports.getHMac = (type = 'sha1', str, key, output) => {
  const c = crypto.createHmac(type, key).update(str)

  if (output === 'base64') {
    return c
      .digest()
      .toString('base64')
      .toUpperCase()
  }

  return c.digest('hex').toUpperCase()
}

/**
 * 获取加盐加密字符串
 * @param {string} md5Str md5字符串
 * @param {string} secret 加密密钥
 * @param {string} salt 盐
 * @returns {string} salted hash str
 */
exports.getSaltedHashStr = (md5Str, secret, salt = CONFIG.webServer.secret) => {
  const strToHash = `@${md5Str}@${secret}@${salt}@`

  return exports.getSha1(strToHash)
}

/**
 * AES加密
 *
 * @param {string} rawText 待加密内容
 * @param {string(32)} [key=CONFIG.aes.key] 密匙
 * @param {string(16)} [iv=CONFIG.aes.iv] 向量
 * @param {string} [method=aes-256-cbc] 加密算法(aes-256-cbc|aes-128-cbc)
 * @returns {string} base64 str
 */
exports.aesEncrypt = (rawText, key = CONFIG.aes.key, iv = CONFIG.aes.iv, method = 'aes-256-cbc') => {
  try {
    const c = crypto.createCipheriv(method, key, iv)
    const chunks = [c.update(rawText, 'binary', 'base64'), c.final('base64')]
    return chunks.join('')
  } catch (ex) {
    console.log('aesEncrypt失败: ', ex)
    return null
  }
}

/**
 * AES解密
 *
 * @param {string} base64Output 待解密内容
 * @param {string(32)} [key=CONFIG.aes.key] 密匙
 * @param {string(16)} [iv=CONFIG.aes.iv] 向量
 * @param {string} [method=aes-256-cbc] 加密算法(aes-256-cbc|aes-128-cbc)
 * @returns {string} text str
 */
exports.aesDecrypt = (base64Output, key = CONFIG.aes.key, iv = CONFIG.aes.iv, method = 'aes-256-cbc') => {
  try {
    const c = crypto.createDecipheriv(method, key, iv)
    const chunks = [c.update(base64Output, 'base64', 'binary'), c.final('binary')]
    return chunks.join('')
  } catch (ex) {
    console.log('aesDecrypt失败: ', ex)
    return null
  }
}

/**
 * 转换为Base64
 * @param {string} str 待转换内容
 * @returns {string} 转换后base64
 */
exports.base64Encode = str => {
  if ('string' !== typeof str) str = CircularJSON.stringify(str)

  return Buffer.from(str).toString('base64')
}

/**
 * 从Base64转回字符串
 * @param {string} str 待解密字符串
 * @returns {string} 解密后字符串
 */
exports.base64Decode = base64str => {
  return Buffer.from(base64str, 'base64').toString()
}

/**
 * 数字运算
 *
 * @param {string} execStr 运算字符串
 * @param {int} [fixed] 保留小数
 * @return {int} exec result
 */
exports.compute = (execStr, fixed) => {
  mathjs.create(mathjs.all, {
    number: 'BigNumber', // Default type of number:
    precision: 20, // Number of significant digits for BigNumbers
  })

  const unformatVal = mathjs.evaluate(execStr)
  const formatVal = mathjs.format(unformatVal, { notation: 'fixed', precision: fixed }) * 1

  return fixed ? formatVal : formatVal.toFixed(0) * 1
}

/**
 * 对象排序
 *
 * @param {object} obj 运算字符串
 * @param {function} func 排序函数
 * @return {object} data
 */
exports.sortObj = (obj, func) => {
  const keys = Object.keys(obj).sort(func)

  const r = {}
  for (const k of keys) {
    r[k] = obj[k]
  }

  return r
}

exports.strPlus = (...args) => `${args.join('')}`

/**
 * 获取签名字符串
 *
 * @param {object} o 待签名内容
 * @param {array|string} e 排除数据
 * @returns {string} 待签名字符串
 */
exports.getSignStr = (o, e = ['sign']) => {
  if (!Array.isArray(e)) e = [e]
  const keys = Object.keys(o).sort()

  const signStr = []
  for (const k of keys) {
    if (e.includes(k) || k === '') continue
    signStr.push(`${k}=${o[k]}`)
  }
  return signStr.join('&')
}

exports.dataMask = (str, type = 'id') => {
  if (exports.isEmpty(str)) return str

  switch (type) {
    case 'id':
      if (str.length > 3) {
        str = `${str.slice(0, 1)}***${str.slice(-1)}`
      }
      break
    case 'phone':
      if (str.length > 3) {
        str = `${str.slice(0, 3)} **** **${str.slice(-2)}`
      }
      break
    case 'email':
      str = `${str.split('@')[0].slice(0, 1)}***@${str.split('@')[1]}`
      break
    default:
      break
  }

  return str
}

exports.safeData = (data, deleteFields = ['seq', 'password']) => {
  for (const field of deleteFields) {
    delete data[field]
  }

  return data
}

/**
 * 格式化字符串
 *
 * @param {string} patten 格式
 * @param  {...any} args 参数
 * @returns {string} 字符串, 如: strf('{0} {1}!', 'Hello', 'World') => 'Hello World'
 */
exports.strf = (patten, ...args) => {
  if (!args.length) return patten

  return patten.replace(/\{(\d+)\}/g, (m, i) => `${args[i]}`)
}

exports.jsonParse = str => {
  try {
    str = CircularJSON.parse(str)
  } catch (ex) {
    console.log('jsonParse失败: ', ex)
    str = {}
  }

  return str
}

exports.jsonStringify = data => {
  try {
    data = CircularJSON.stringify(data)
  } catch (ex) {
    console.log('jsonStringify失败: ', ex)
    data = ''
  }

  return data
}

exports.jsonFormat = json => (json === Object(json) ? CircularJSON.parse(CircularJSON.stringify(json)) : json)

// 下划线转换驼峰
exports.toHump = name => name.replace(/_(\w)/g, (all, letter) => letter.toUpperCase())

// 驼峰转换下划线
exports.toLine = name =>
  name
    .replace(/([A-Z])/g, '_$1')
    .replace(/^_/, '')
    .toLowerCase()

exports.isMobile = ua => {
  if (ua.isMobile) return true

  ua.source = ua.source && ua.source.toLowerCase()
  if (
    // 微信
    ua.source.includes('micromessenger') ||
    // IOS
    ua.source.includes('darwin') ||
    ua.source.includes('cfnetwork') ||
    // Andriod
    ua.source.includes('okhttp')
  ) {
    return true
  }

  // Postman
  if (ua.source.includes('postmanruntime')) return false
}

exports.toBoolean = o => {
  if (o === true || o === false) return o

  if (typeof o === 'number' || !Number.isNaN(parseInt(o, 10))) return parseInt(o, 10) > 0

  if (typeof o === 'string') {
    if (['true', 'yes', 'ok', 'on', '1'].includes(o)) return true
    if (['false', 'no', 'ng', 'off', 0].includes(o)) return false
  }

  return false
}

exports.json2xml = json => {
  const builder = new xml2js.Builder({
    rootName: 'xml',
    cdata: true,
    headless: true,
    allowSurrogateChars: true,
  })
  return Promise.resolve(builder.buildObject(json))
}

exports.xml2json = xml => {
  const parser = new xml2js.Parser({
    normalize: true,
    explicitRoot: false,
    explicitArray: false,
  })
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err, res) => {
      if (err) return reject(res || {})

      resolve(res)
    })
  })
}

exports.padFileSrc = (data, prefix = CONFIG.apiServer.baseUrl + CONFIG.webServer.prefix || '') => {
  if (exports.isEmpty(data)) return data

  return data.replace(/(src\s*=\s*['"]?)([^'"]*files)/g, `$1${prefix}/files`)
}

exports.isStream = val => val !== null && typeof val === 'object' && typeof val.pipe === 'function'

exports.isHas = (data, key) => {
  if (util.isArray(data)) return data.includes(key)
  if (util.isObject(data)) return Object.prototype.hasOwnProperty.call(data, key)

  return false
}

exports.util = util

//获取文件真实类型
exports.getFileMimeType = filePath => {
  const buffer = new Buffer(8)
  const fd = fs.openSync(filePath, 'r')
  fs.readSync(fd, buffer, 0, 8, 0)
  const newBuf = buffer.slice(0, 4)
  const typeCode = newBuf[0].toString(16) + newBuf[1].toString(16) + newBuf[2].toString(16) + newBuf[3].toString(16) // head

  let filetype = ''
  let mimetype
  switch (typeCode) {
    case 'ffd8ffe1':
      filetype = 'jpg'
      mimetype = ['image/jpeg', 'image/pjpeg']
      break
    case 'ffd8ffe0':
      filetype = 'jpg'
      mimetype = ['image/jpeg', 'image/pjpeg']
      break
    case 'ffd8ffdb':
      filetype = 'jpg'
      mimetype = ['image/jpeg', 'image/pjpeg']
      break
    case '47494638':
      filetype = 'gif'
      mimetype = 'image/gif'
      break
    case '89504e47':
      filetype = 'png'
      mimetype = ['image/png', 'image/x-png']
      break
    case '504b34':
      filetype = 'zip'
      mimetype = ['application/x-zip', 'application/zip', 'application/x-zip-compressed']
      break
    case '2f2aae5':
      filetype = 'js'
      mimetype = 'application/x-javascript'
      break
    case '2f2ae585':
      filetype = 'css'
      mimetype = 'text/css'
      break
    case '5b7bda':
      filetype = 'json'
      mimetype = ['application/json', 'text/json']
      break
    case '3c212d2d':
      filetype = 'ejs'
      mimetype = 'text/html'
      break
    default:
      filetype = 'unknown'
      break
  }

  fs.closeSync(fd)

  return {
    fileType: filetype,
    mimeType: mimetype,
  }
}

/**
 * 文件大小格式
 *
 * 122343345283B => 113.94GB
 */
exports.formatSize = (size, delimiter = '') => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  for (var i = 0; size >= 1024 && i < 5; i++) size /= 1024
  return Math.round(size * 100) / 100 + delimiter + units[i]
}

/**
 * unix时间戳转时间
 * 1594889129161 => 2020-07-16-16:45:29
 */
exports.formatTime = ts => {
  const date = new Date(ts)

  let dateStr = ''
  dateStr += date.getFullYear() // 获取完整的年份(4位,1970-????)
  dateStr += '-' + `${date.getMonth() + 1}`.padStart(2, 0) // 获取当前月份(01-12)
  dateStr += '-' + `${date.getDate()}`.padStart(2, 0) // 获取当前日(01-31)
  dateStr += '-' + `${date.getHours()}`.padStart(2, 0) // 获取当前小时数(0-23)
  dateStr += ':' + `${date.getMinutes()}`.padStart(2, 0) // 获取当前分钟数(0-59)
  dateStr += ':' + `${date.getSeconds()}`.padStart(2, 0) // 获取当前秒数(0-59)

  return dateStr
}
