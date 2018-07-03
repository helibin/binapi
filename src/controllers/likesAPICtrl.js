/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { likesMod } from '../models';
import Base from './_base';


export default new class extends Base {
// ?limit=10：指定返回记录的数量
// ?offset=10：指定返回记录的开始位置。
// ?page=2&per_page=100：指定第几页，以及每页的记录数。
// ?sortby=name&order=asc：指定返回结果按照哪个属性排序，以及排序顺序。
// ?animal_type_id=1：指定筛选条件
  async list(ctx) {
    let ret = this.t.initRet();

    const opt = {
      offset: ctx.state.pageSetting.pageStart,
      limit : ctx.state.pageSetting.pageSize,
    };
    const result = await likesMod.findAndCountAll(opt);

    ret = this.t.genPageInfo(ctx, result.rows);
    ctx.state.sendJSON(ret);
  }


  async add(ctx) {
    const ret = this.t.initRet();
    const body = ctx.request.body;

    const newData = {
      id       : this.t.genUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    Object.assign(newData, body);
    const likeCheck = await likesMod.findOne({ where: { $or: { nickname: body.nickname } } });
    if (likeCheck) { throw new this._e('EBizRule', 'xxx'); }

    await likesMod.create(newData);

    ret.data = { newDataId: newData.id };

    ctx.body = ret;
  }
}();
