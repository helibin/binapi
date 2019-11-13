/*
 * @Author: helibin@139.com
 * @Date: 2018-08-01 23:12:54
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 09:26:05
 */
/** 内建模块 */

/** 第三方模块 */
import mailer from 'nodemailer'
import chalk from 'chalk'

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import Log from './logger'

/** 预处理 */
const user = CONFIG.nodeMailer.user
const password = CONFIG.nodeMailer.password
let transporter = {}

if (user && password) {
  const transportOpt = {
    host: CONFIG.nodeMailer.host,
    port: CONFIG.nodeMailer.port,
    secure: CONFIG.nodeMailer.secure, // true for 465, false for other ports
    auth: {
      user: CONFIG.nodeMailer.user, // generated ethereal user
      pass: CONFIG.nodeMailer.password, // generated ethereal password
    },
  }
  transporter = mailer.createTransport(transportOpt)

  transporter.verify(ex => {
    if (ex) {
      Log.logger('ex', 'nodeMail服务初始化失败：', ex)
    } else {
      Log.logger(null, 'nodeMail服务初始化完成')
    }
  })
} else {
  Log.logger('error', 'nodeMail服务缺少参数：', `user='${user}', password='${password}'`)
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.transporter = transporter
  }

  async sendMail(receivers, subject = 'Hello ✔', template = 'hellow, world!') {
    const now = Date.now()
    const mailOptions = {
      from: `${CONFIG.nodeMailer.name} ${CONFIG.nodeMailer.sender}`, // sender address
      to: receivers, // list of receivers
      subject, // Subject line
      html: template, // html body
    }
    try {
      return await transporter.sendMail(mailOptions)
    } catch (ex) {
      this.ctx.state.hasError = true

      this.ctx.state.logger(
        ex,
        '发送邮件失败',
        ex,
        `参数：${JSON.stringify(mailOptions)}`,
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      throw ex
    } finally {
      this.ctx.state.logger(
        this.ctx.state.hasError,
        'NodeMailer调用方法：[sendMail],',
        `发送${subject}类型验邮件至${receivers}：${this.ctx.state.hasError ? '失败' : '成功'},`,
        chalk.green(`用时：${Date.now() - now}ms`),
      )
    }
  }
}
