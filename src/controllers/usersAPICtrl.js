

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './_base';

/** 项目模块 */
import { usersMod } from '../models';


export default new class extends Base {
  async list(ctx) {
    const ret = this.t.initRet();

    const opt = {
      offset: ctx.state.pageSetting.pageStart,
      limit : ctx.state.pageSetting.pageSize,
    };
    const result = await usersMod.findAndCountAll(opt);
    ret.data = result.rows;
    ret.pageInfo = this.t.genPageInfo(ctx, result);

    ctx.state.logger('debug', '列出用户');
    ctx.state.sendJSON(ret);
  }

  async get(ctx) {
    const ret = this.t.initRet();
    const targetId = ctx.params.targetId;

    const opt = { where: { id: targetId } };
    ret.data = await usersMod.findOne(opt);

    if (!ret.data) throw new this._e('EClientNotFound', 'noSuchUser', { userId: targetId });

    ctx.state.logger('debug', `获取用户：userId=${targetId}`);
    ctx.state.sendJSON(ret);
  }

  async add(ctx) {
    let ret = this.t.initRet();

    const newData = {
      id       : this.t.genUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    Object.assign(newData, ctx.request.body);
    try {
      await usersMod.create(newData);
    } catch (e) {
      ret = e;
    }

    ret.data = { newDataId: newData.id };
    ctx.body = ret;
  }

  async modify(ctx) {
    const ret = this.t.initRet();

    const targetId = ctx.params.targetId;
    const nextData = { updatedAt: Date.now() };
    Object.assign(nextData, ctx.request.body);

    const opt = { where: { id: targetId } };
    await usersMod.update(nextData, opt);

    ctx.state.logger('debug', `修改用户：userId=${ctx.params.targetId}`);
    ctx.state.sendJSON(ret);
  }

  async delete(ctx) {
    const ret = this.t.initRet();

    const opt = { where: { id: ctx.params.targetId } };
    await usersMod.destroy(opt);

    ctx.state.logger('debug', `删除用户：userId=${ctx.params.targetId}`);
    ctx.state.sendJSON(ret);
  }
}();
