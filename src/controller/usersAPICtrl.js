

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { usersMod } from '../model';


export default new class extends Base {
  async list(ctx) {
    let ret = this.t.initRet();

    const opt = {
      offset: ctx.state.pageSetting.pageStart,
      limit : ctx.state.pageSetting.pageSize,
    };
    const result = await usersMod.findAndCountAlls(opt);

    ret = this.t.genPageInfo(ctx, result.rows);

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
    const ret   = this.t.initRet();
    const newData  = ctx.request.body;
    const newId = this.t.genUUID();

    newData.id    = newId;

    await usersMod.create(newData);
    ret.data = { newDataId: newId };

    ctx.state.logger('debug', `新增用户: id=${newId}`, newData);
    ctx.state.sendJSON(ret);
  }

  async modify(ctx) {
    const ret      = this.t.initRet();
    const targetId = ctx.params.targetId;

    const opt = { where: { id: targetId } };
    await usersMod.update(ctx.request.body, opt);

    ctx.state.logger('debug', `修改用户：userId=${targetId}`, ctx.request.body);
    ctx.state.sendJSON(ret);
  }

  async delete(ctx) {
    const ret = this.t.initRet();
    const targetId = ctx.params.targetId;

    const opt = { where: { id: targetId } };
    await usersMod.destroy(opt);

    ctx.state.logger('debug', `删除用户：userId=${targetId}`);
    ctx.state.sendJSON(ret);
  }
}();
