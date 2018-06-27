/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import t from '../base_modules/tools';

/** 项目模块 */
import likesMod from '../models/likesMod';


const M = {};

// ?limit=10：指定返回记录的数量
// ?offset=10：指定返回记录的开始位置。
// ?page=2&per_page=100：指定第几页，以及每页的记录数。
// ?sortby=name&order=asc：指定返回结果按照哪个属性排序，以及排序顺序。
// ?animal_type_id=1：指定筛选条件
M.listLikes = async (ctx) => {
  let ret = t.initRet();

  const opt = {
    offset: ctx.state.pageSetting.pageStart,
    limit : ctx.state.pageSetting.pageSize,
  };
  try {
    const result = await likesMod.findAndCountAll(opt);

    ret = t.genPageInfo(ctx, result.rows);
  } catch (e) {
    throw e;
  }
  ctx.state.sendJSON(ret);
};


M.addLike = async (ctx) => {
  const ret = t.initRet();
  const body = ctx.request.body;

  const newData = {
    id       : t.genUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  Object.assign(newData, body);
  try {
    const like = await likesMod.findOne({ where: { $or: { nickname: body.nickname } } });

    await likesMod.create(newData);

    ret.data = { newDataId: newData.id };
  } catch (e) {
    throw e;
  }

  ctx.body = ret;
};

export default M;
