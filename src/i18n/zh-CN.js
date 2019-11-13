/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 19:00:54
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-30 18:23:53
 */
module.exports = {
  resMsg: {
    ok: '成功',
    okFromCache: '成功, 来至缓存',
    okFromDebug: '成功, 来自调试',

    // Auth
    userNotSignedIn: '用户未登录',
    invalidXAuthToken: '无效认证令牌',
    xAuthTokenExpired: '认证令牌已过期',
    userIsDisabled: '用户已被禁用',

    // Device
    deviceNotSignIn: '设备未登录',
    invalidxDeviceToken: '无效设备令牌',
    xDeviceTokenExpired: '设备令牌已过期',
    deviceDisabled: '设备已被禁用',

    // User
    invildUsenameOrPassowrd: '用户名或密码错误',
    noSuchIdentifier: '用户未注册',
    noSuchUser: '没有此用户',
    noSuchMuser: '没有此后台用户',
    userExisted: '用户已存在',
    muserExisted: '后台用户已存在',
    invalidUsername: '无效用户名',
    identifierExisted: '用户名已存在',
    noSuchPrivilege: '没有此权限',

    // Client
    noSuchRouter: '路由不存在',
    invalidParam: '无效参数',
    requestFrequently: '请求频繁',
    requestForbidden: '访问被拒绝',
    requestEntityTooLarge: '请求体过大',

    // BizRule
    dataIsNotYours: '操作他人数据',
    noSuchResource: '资源不存在',
    databaseInited: '数据库已初始化',
    invalidCaptchaToken: '无效的验证码令牌',
    invalidCaptcha: '无效图形验证码',
    invalidSMSCode: '无效短信验证码',
    tooLargeTimeSpanFromCS: '客户端与服务端时间差异过大',
    nonceIsUsed: '随机数已使用',
    noSuchAccessKey: 'AK不存在',
    noSuchCode: '序列号不存在',
    invalidSign: '无效签名',

    // Server
    eWebServer: 'Web服务器错误',
    eSocketIO: 'SocketIO错误',
    eMysql: 'Mysql错误',
    eRedis: 'Redis错误',
    eOpenAPI: '第三方API错误',
    eAliyunAPI: '阿里云API错误',
    eWeixinAPI: '微信API错误',
    unknown: '未知错误',

    // i18n
    canNotDoThisForSA: '禁止对超管账号操作',
  },

  resCode: {
    0: '成功',
    10000: '用户未登录',
    10010: '无效认证令牌',
    10020: '令牌已过期',
    10030: '用户已被禁用',
    11000: '设备未登录',
    11010: '无效设备令牌',
    11020: '设备令牌已过期',
    11030: '设备已被禁用',
    20000: '用户名或密码错误',
    20010: '用户未注册',
    20020: '没有此用户',
    20030: '没有此后台用户',
    20040: '用户已存在',
    20050: '后台用户已存在',
    20060: '无效用户名',
    20070: '用户名已存在',
    20080: '没有此权限',
    30010: '路由不存在',
    30030: '无效参数',
    30040: '请求频繁',
    30050: '访问被拒绝',
    30060: '无效短信验证码',
    40000: '操作他人数据',
    40010: '无效验证码',
    40020: '资源不存在',
    40030: '数据库已初始化',
    50000: 'Web服务器错误',
    70010: 'Mysql错误',
    70020: 'Redis错误',
    80000: '第三方API错误',
    80100: '阿里云API错误',
    80200: '微信API错误',
    90000: '未知错误',
  },

  joi: {
    key: '`{{label}}`',
    any: {
      required: '不可缺少',
      length: '长度必须为{{limit}}',
      empty: '不允许为空',
      invalid: '包含不合法内容`{{value}}`',
      allowOnly: '无效的值：{{value}}',
    },
    string: {
      length: '长度必须为{{limit}}',
      min: '长度不能少于{{limit}}',
      max: '长度不能大于{{limit}}',
      regex: { base: '无效的值：{{value}}' },
      email: '必须为合法的电子邮箱地址',
    },
    number: {
      base: '必须是数字类型',
      min: '不能少于{{limit}}',
      max: '不能大于{{limit}}',
      integer: '必须为整数',
      positive: '必须为正数',
    },
    boolean: { base: '必须是布尔类型' },
    object: { base: '必须是一个对象' },
    date: { isoDate: '必须是有效的ISO格式的时间' },
  },
}
