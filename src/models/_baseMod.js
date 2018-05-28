'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../base_modules/tools'

/** 项目模块 */
import mysql from '../base_modules/mysqlHelper'


/**
 * 通用添加方法
 */

/**
 * 定义数据模型
 *
 * @param {any} tableName 模型名称【数据库表名】
 * @param {any} attributes 数据字段集合
 * @returns 数据模型对象
 */
function defineModel(tableName, attributes) {
  var attrs = {};

  for (let key in attributes) {
    let value = attributes[key];
    if (typeof value === 'object' && value['type']) {
      value.allowNull = value.allowNull || false;
      attrs[key] = value;
    } else {
      attrs[key] = {
        type: value,
        allowNull: false
      };
    }
  }

  // 附加公共字段
  attrs.seq = {
    type: mysql.Sequelize.BIGINT,
    primaryKey: true
  };
  attrs.createAt = {
    type: mysql.Sequelize.BIGINT,
    allowNull: false
  };
  attrs.updateAt = {
    type: mysql.Sequelize.BIGINT,
    allowNull: false
  };
  attrs.version = {
    type: mysql.Sequelize.BIGINT,
    allowNull: false
  };
  // 状态：0表示有效，1表示无效，2表示已删除，默认为0.
  attrs.status = {
    type: mysql.Sequelize.INTEGER,
    allowNull: false
  };

  // 调用seq的方法定义模型并返回
  return mysql.sequelize.define(tableName, attrs, {
    tableName: tableName,
    timestamps: false,
    hooks: {
      beforeValidate: function (obj) {
        let now = Date.now();
        if (obj.isNewRecord) {
          obj.createAt = now;
          obj.updateAt = now;
          obj.version = 0;
        } else {
          obj.updateAt = now;
          ++obj.version;
        }
      }
    }
  });
}
