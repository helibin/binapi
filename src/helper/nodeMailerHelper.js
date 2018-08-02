/*
 * @Author: helibin@139.com
 * @Date: 2018-08-01 23:12:54
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-02 22:44:38
 */
/** 内建模块 */

/** 第三方模块 */
import mailer from 'nodemailer';

/** 基础模块 */
import CONFIG from 'config';
import t      from './tools';

/** 项目模块 */

/** 预处理 */
const transportOpt = {
  host  : CONFIG.nodeMailer.host,
  port  : CONFIG.nodeMailer.port,
  secure: CONFIG.nodeMailer.secure, // true for 465, false for other ports
  auth  : {
    user: CONFIG.nodeMailer.user, // generated ethereal user
    pass: CONFIG.nodeMailer.password, // generated ethereal password
  },
};
const transporter = mailer.createTransport(transportOpt);

transporter.verify((ex) => {
  if (ex) {
    console.log(ex);
  } else {
    console.log('Server is ready to take our messages');
  }
});

export default class {
  constructor(ctx) {
    this.ctx         = ctx;
    this.ret         = t.initRet();
    this.transporter = transporter;
  }

  async sendMail(receivers, subject = 'Hello ✔', template = 'hellow, world!') {
    const now = Date.now();
    const mailOptions = {
      from: `${CONFIG.nodeMailer.name} ${CONFIG.nodeMailer.sender}`, // sender address
      to  : receivers, // list of receivers
      subject, // Subject line
      html: template, // html body
    };
    try {
      await transporter.sendMail(mailOptions);

      return this.ret;
    } catch (ex) {
      this.ctx.state.hasError = true;

      this.ctx.state.logger(ex, '发送邮件失败', ex, `参数：${JSON.stringify(mailOptions)}`, `用时：${Date.now() - now}ms。`);
      throw ex;
    } finally {
      this.ctx.state.logger(this.ctx.state.hasError,
        'NodeMailer调用方法：[sendMail],',
        `发送${subject}类型验邮件至${receivers}：${this.ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
    }
  }
}
