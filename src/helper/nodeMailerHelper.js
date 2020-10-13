/*
 * @Author: helibin@139.com
 * @Date: 2018-08-01 23:12:54
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-02-26 11:09:51
 */
/** 内建模块 */

/** 第三方模块 */
import NodeMailer from 'nodemailer'
import chalk from 'chalk'

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import Log from './logger'

/** 预处理 */
const nodeMailerConfig = CONFIG.nodeMailer
const user = nodeMailerConfig.user
const password = nodeMailerConfig.password

let transporter = {}
if (user && password) {
  const transportOpt = {
    host: nodeMailerConfig.host,
    port: nodeMailerConfig.port,
    secure: nodeMailerConfig.secure,
    auth: { user: nodeMailerConfig.user, pass: nodeMailerConfig.password },
  }
  transporter = NodeMailer.createTransport(transportOpt)

  transporter.verify(ex => {
    if (ex) {
      Log.logger('ex', 'nodeMail服务初始化失败: ', ex)
    } else {
      Log.logger(null, 'nodeMail服务初始化完成')
    }
  })
} else {
  Log.logger('error', 'nodeMail服务缺少参数: ', `user='${user}', password='${password}'`)
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.transporter = transporter
  }

  async sendMail(receivers = [], subject = 'Hello ✔', template = 'hellow, world!') {
    const now = Date.now()
    const mailOptions = {
      from: `${nodeMailerConfig.name} ${nodeMailerConfig.sender}`, // sender address
      to: receivers,
      subject,
      html: template,
    }
    try {
      return await this.transporter.sendMail(mailOptions)
    } catch (ex) {
      this.ctx.state.hasError = true

      this.ctx.state.logger(
        ex,
        '发送邮件失败',
        ex,
        `参数: ${JSON.stringify(mailOptions)}`,
        chalk.green(`用时: ${Date.now() - now}ms`),
      )
      throw ex
    } finally {
      this.ctx.state.logger(
        this.ctx.state.hasError,
        'NodeMailer调用方法: [sendMail],',
        `发送${subject}类型验邮件至${receivers}: ${this.ctx.state.hasError ? '失败' : '成功'},`,
        chalk.green(`用时: ${Date.now() - now}ms`),
      )
    }
  }
}
