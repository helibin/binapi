/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 15:03:30
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'
import chalk from 'chalk'

/** 项目模块 */
import Mod from '../model'

/** 项目模块 */

module.exports = new (class extends Base {
  baseExists(modelName, errorMsg, dataIdPosition, dataField = 'id') {
    return async (ctx, next) => {
      const now = Date.now()
      try {
        const model = `${modelName}Mod`

        let dataId = ctx.params.targetId
        if (dataIdPosition) {
          dataId = this.t.jsonFind(ctx, dataIdPosition, true)
        }

        ctx.state[`biz_${modelName}`] = await Mod[model].get(ctx, {
          [dataField]: dataId,
        })

        if (this.t.isEmpty(ctx.state[`biz_${modelName}`])) {
          throw new this.ce('noSuchResource', errorMsg, {
            data_id: dataId,
          })
        }

        return next()
      } catch (ex) {
        ctx.state.hasError = true

        throw ex
      } finally {
        ctx.state.logger(
          ctx.state.hasError,
          `Mid调用方法：[baseExists] ${ctx.state.hasError ? '终止' : '通过'},`,
          chalk.green(`用时：${Date.now() - now}ms`),
        )
      }
    }
  }

  baseNotExists(modelName, errorMsg, dataIdPosition, dataField = 'id') {
    return async (ctx, next) => {
      const now = Date.now()
      try {
        const model = `${modelName}Mod`

        let dataId = ctx.params.targetId
        if (dataIdPosition) {
          dataId = this.t.jsonFind(ctx, dataIdPosition, true)
        }
        const dbCheck = await Mod[model].get(ctx, { [dataField]: dataId })

        if (!this.t.isEmpty(dbCheck)) {
          throw new this.ce('dataExisted', errorMsg, {
            data_id: dataId,
          })
        }
        return next()
      } catch (err) {
        ctx.state.hasError = true

        throw err
      } finally {
        ctx.state.logger(
          ctx.state.hasError,
          `Mid调用方法：[baseNotExists] ${ctx.state.hasError ? '终止' : '通过'},`,
          chalk.green(`用时：${Date.now() - now}ms`),
        )
      }
    }
  }

  baseNotDisabled(modelName, errorMsg, dataIdPosition, dataField = 'id') {
    return async (ctx, next) => {
      const now = Date.now()
      try {
        const model = `${modelName}Mod`

        let dataId = ctx.params.targetId
        if (dataIdPosition) {
          dataId = this.t.jsonFind(ctx, dataIdPosition, true)
        }
        const dbCheck = await Mod[model].get(ctx, { [dataField]: dataId })

        if (!this.t.isEmpty(dbCheck) && dbCheck.is_disabeld) {
          throw new this.ce('dataDisabled', errorMsg, { data_id: dataId })
        }

        return next()
      } catch (ex) {
        ctx.state.hasError = true

        throw ex
      } finally {
        ctx.state.logger(
          ctx.state.hasError,
          `Mid调用方法：[baseNotDisabled] ${ctx.state.hasError ? '终止' : '通过'},`,
          chalk.green(`用时：${Date.now() - now}ms`),
        )
      }
    }
  }

  /**
   * 通用存在
   *
   * @param {string} modelName 模型名字
   * @param {string} dataIdPosition 指定ctx下需校验的数据位置, 如：'params.targetId'
   * @param {string} dataField 指定查找字段, 如：id
   * @return {*} none
   */
  commonExists(modelName, dataIdPosition, dataField) {
    return this.baseExists(
      modelName,
      `noSuch${modelName.replace(/^\S/, s => s.toUpperCase())}`,
      dataIdPosition,
      dataField,
    )
  }

  /**
   * 通用不存在
   *
   * @param {string} modelName 模型名字
   * @param {string} dataIdPosition 指定ctx下需校验的数据位置, 如：'params.targetId'
   * @param {string} dataField 指定查找字段, 如：id
   * @return {*} none
   */
  commonNotExists(modelName, dataIdPosition, dataField) {
    return this.baseNotExists(modelName, `${modelName}Existed`, dataIdPosition, dataField)
  }

  /**
   * 通用未禁用
   *
   * @param {string} modelName 模型名字
   * @param {string} dataIdPosition 指定ctx下需校验的数据位置, 如：'params.targetId'
   * @param {string} dataField 指定查找字段, 如：id
   * @return {*} none
   */
  commonNotDisabled(modelName, dataIdPosition, dataField) {
    return this.baseNotDisabled(modelName, `${modelName}Disabled`, dataIdPosition, dataField)
  }

  authExists(dataIdPosition, dataField = 'identifier') {
    return this.baseExists('auth', 'noSuchIdentifier', dataIdPosition, dataField)
  }

  authNotExists(dataIdPosition, dataField = 'identifier') {
    return this.baseNotExists('auth', 'identifierExisted', dataIdPosition, dataField)
  }

  identifierExists(dataIdPosition, dataField = 'identifier') {
    return this.baseExists('muser', 'noSuchMuser', dataIdPosition, dataField)
  }

  identifierNotExists(dataIdPosition, dataField = 'identifier') {
    return this.baseNotExists('muser', 'muserExisted', dataIdPosition, dataField)
  }

  userExists(dataIdPosition, dataField) {
    return this.baseExists('user', 'noSuchUser', dataIdPosition, dataField)
  }

  userNotExists(dataIdPosition, dataField) {
    return this.baseNotExists('user', 'userExisted', dataIdPosition, dataField)
  }

  deviceAKExists(dataIdPosition, dataField = 'ak_id') {
    return this.baseExists('device', 'noSuchAK', dataIdPosition, dataField)
  }

  deviceCodeNotRegister() {
    return this.baseNotExists('device', 'deviceRegistered', 'request.body.code', 'code')
  }

  baseOwner(modelName, errorMsg, dataIdPosition, dataField = 'id', ownerIdPosition, ownerField = 'user_id') {
    return async (ctx, next) => {
      const now = Date.now()
      try {
        const model = `${modelName}Mod`

        let dataId = ctx.params.targetId
        if (dataIdPosition) {
          dataId = this.t.jsonFind(ctx, dataIdPosition, true)
        }
        let ownerId = ctx.state.userId
        if (ownerIdPosition) {
          ownerId = this.t.jsonFind(ctx, ownerIdPosition, true)
        }
        const dbCheck = await Mod[model].get(ctx, {
          [dataField]: dataId,
          [ownerField]: ownerId,
        })

        if (this.t.isEmpty(dbCheck)) {
          throw new this.ce('dataIsNotYours', errorMsg, {
            data_id: dataId,
          })
        }
        return next()
      } catch (ex) {
        ctx.state.hasError = true

        throw ex
      } finally {
        ctx.state.logger(
          ctx.state.hasError,
          `Mid调用方法：[baseOwner] ${ctx.state.hasError ? '终止' : '通过'},`,
          chalk.green(`用时：${Date.now() - now}ms`),
        )
      }
    }
  }

  /**
   * 通用内容对象所属用户
   *
   * @param {string} modelName 模型名字
   * @param {string} dataIdPosition 指定ctx下需校验的数据位置, 如：'params.targetId'
   * @param {string} ownerIdPosition 指定ctx下需校验的数据位置, 如：'params.userId'
   * @return {*} none
   */
  commonOwner(modelName, dataIdPosition, ownerIdPosition) {
    return this.baseOwner(modelName, `${modelName}IsNotYours`, ownerIdPosition, dataIdPosition)
  }
})()
