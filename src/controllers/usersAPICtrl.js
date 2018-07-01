

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import t from '../base_modules/tools';

/** 项目模块 */
import usersMod from '../models/usersMod';
import Base from './_base';


export default new class M extends Base {
  async list(ctx) {
    let ret = t.initRet();

    const opt = {
      offset: ctx.state.pageSetting.pageStart,
      limit : ctx.state.pageSetting.pageSize,
    };
    try {
      const result = await usersMod.findAndCountAll(opt);
      ret.data = result.rows;

      ret.pageInfo = t.genPageInfo(ctx, result);
    } catch (e) {
      ret = e;
    }
    ctx.body = ret;
  }

  async get(ctx) {
    let ret = t.initRet();

    const opt = { where: { id: ctx.params.targetId } };

    try {
      ret.data = await usersMod.findOne(opt);
    } catch (e) {
      ret = e;
    }
    ctx.body = ret;
  }

  async add(ctx) {
    let ret = t.initRet();

    const newData = {
      id       : t.genUUID(),
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
    let ret = t.initRet();

    const targetId = ctx.params.targetId;
    const nextData = { updatedAt: Date.now() };
    Object.assign(nextData, ctx.request.body);

    const opt = { where: { id: targetId } };

    try {
      await usersMod.update(nextData, opt);
    } catch (e) {
      ret = e;
    }

    ctx.body = ret;
  }

  async delete(ctx) {
    let ret = t.initRet();

    const opt = { where: { id: ctx.params.targetId } };

    try {
      await usersMod.destroy(opt);
    } catch (e) {
      ret = e;
    }

    ctx.body = ret;
  }
}();
