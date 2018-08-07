/*
 * @Author: helibin@139.com
 * @Date: 2018-08-06 14:25:59
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-06 14:27:51
 */
/** 内建模块 */

/** 第三方模块 */
import axios from 'axios';

/** 基础模块 */

/** 项目模块 */

/** 预处理 */
axios.interceptors.response.use(res => res.data, err => Promise.reject(err));


export default class {
  constructor(ctx) {
    this.ctx = ctx;
    this.axios = axios;
  }
}
