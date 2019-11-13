/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-23 18:09:08
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */

module.exports = new (class extends Base {
  async tempUpload(ctx, filenamePatten, filePathPatten) {
    const ret = this.t.initRet()
    const userId = ctx.state.userId
    const { file } = ctx.request.files || {}

    const filename = this.t.strf(
      filenamePatten,
      Date.now(),
      this.t.genRandStr(8).toLocaleLowerCase(),
      file.name.split('.').slice(-1)[0],
    )
    const filePath = this.t.strf(filePathPatten, userId, filename)

    // 开始上传
    await ctx.state.alyOss.upload(filePath, file.path)

    ret.data = { filename, file_path: filePath }
    ctx.state.logger('debug', '上传临时文件')
    ctx.state.sendJSON(ret)
  }
})()
