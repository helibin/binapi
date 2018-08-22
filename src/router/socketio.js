/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-20 18:42:26
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */

/** 预处理 */

export default (ctx) => {
  ctx.io.on('connection', socket => console.log(socket));
};
