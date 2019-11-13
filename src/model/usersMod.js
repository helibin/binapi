/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-30 14:00:51
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { authScm, usersScm } from '../schema';


export default new class extends Base {
  constructor() {
    super();
    this.model = usersScm;
  }

  async addUser(ctx, data) {
    this.trans = await this.sequelize.transaction();
    const dbRes = await authScm.create({
      user_id   : data.id,
      identifier: data.identifier,
      password  : data.password,
    }, { transaction: this.trans });

    await usersScm.create(data, { transaction: this.trans });

    await this.trans.commit();
    return dbRes;
  }

  async delUser(ctx, targetId) {
    this.trans = await this.sequelize.transaction();

    let dbRes = await authScm.destroy({ where: { user_id: targetId } }, { transaction: this.trans });
    dbRes     = await usersScm.destroy({ where: { id: targetId } }, { transaction: this.trans });

    await this.trans.commit();
    return dbRes;
  }
}();
