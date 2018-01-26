'use strict'

/** 内建模块 */

/** 第三方模块 */
import uuid from 'uuid'
import CONFIG from 'config'

/** 基础模块 */

/** 项目模块 */

export const genUUID36 = () => {
  let id36 = uuid.v4()
  return id36;
}

export const genUUID = () => {
  let id36 = uuid.v4()
  let id32 = id36.replace(/-/g, '')
  return id32
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
export const genRandStr = (len = 32, chars) => {
  let samples = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let randStr = ''
  for (let i = 0; i < len; i++) {
    let randIndex = Math.floor(Math.random() * samples.length);
    randStr += samples[randIndex];
  }

  return randStr;
}

/**
 * 初始化返回值
 */
export const initRet = () => {
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
export const genPageInfo = (ctx, result) => {
  var pageInfo = {
    pageNumber: ctx.state.pageSetting.pageNumber,
    pageSize: ctx.state.pageSetting.pageSize,
    pageCount: Math.ceil(result.count / ctx.state.pageSetting.pageSize),
    currentCount: result.rows.length,
    totalCount: result.count,
  }

  return pageInfo;
};
