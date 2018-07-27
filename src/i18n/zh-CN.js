/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 19:00:54
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 15:13:54
 */
export default {
  resMsg: {
    ok       : '成功',
    okByCache: '成功，来着缓存',

    noSuchUser     : '没有此用户',
    userIsExisted  : '用户已存在',
    userNotSignedIn: '用户未登录',

    invildUsenameOrPassowrd: '用户名或密码错误',

    noSuchPrivilege: '没有此权限',
  },

  joi: {
    key: '`{{label}}`',
    any: {
      required: '不能为空',
      length  : '长度必须为{{limit}}',
      empty   : '不允许为空',
      invalid : '包含不合法内容`{{value}}`',
    },
    string: {
      length: '长度必须为{{limit}}',
      min   : '长度不能少于{{limit}}',
      max   : '长度不能大于{{limit}}',
      regex : { base: '无效的值：{{value}}' },
      email : '必须为合法的电子邮箱地址',
    },
  },
};
