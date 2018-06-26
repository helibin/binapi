/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import * as t from '../base_modules/tools';

/** 项目模块 */
import likesMod from '../models/likesMod';


const M = {};

M.listLikes = async (ctx) => {
  let ret = t.initRet();

  const opt = {
    offset: ctx.state.pageSetting.pageStart,
    limit: ctx.state.pageSetting.pageSize,
  };
  try {
    const result1 = await likesMod.findAndCountAll(opt);

    ret = t.genPageInfo(ctx, result.rows);
  } catch (e) {
    throw e;
  }
  ctx.state.sendJSON(ret);
};


M.addLike = async (ctx) => {
  let ret = t.initRet();
  const body = ctx.request.body;

  const newData = {
    id: t.genUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  Object.assign(newData, body);
  try {
    const like = await likesMod.findOne({ where: { $or: { nickname: body.nickname } } });

    if (like) {
      await likesMod.update({ updatedAt: Date.now() }, { where: { nickname: body.nickname } });
    } else {
      await likesMod.create(newData);

      ret.data = { newDataId: newData.id };
    }
  } catch (e) {
    ret = e;
  }

  ctx.body = ret;
};

export default M;
