'use strict'

/** 内建模块 */

/** 第三方模块 */
import uuid from 'uuid'

/** 基础模块 */

/** 项目模块 */

const genUUID36 = exports.genUUID36 = () => {
  let id36 = uuid.v4();
  return id36;
}

const genUUID = exports.genUUID = () => {
  let id36 = uuid.v4();
  let id32 = id36.replace(/-/g, '');
  return id32;
}

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
const genRandStr = exports.genRandStr = (len = 32, chars) => {
  let samples = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let randStr = ''
  for (let i = 0; i < len; i++) {
    let randIndex = Math.floor(Math.random() * samples.length);
    randStr += samples[randIndex];
  }

  return randStr;
}
