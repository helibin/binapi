## 线上预览

[https://api.ajaxp.com](https://api.ajaxp.com)

## 前置条件

- Node.js >= 8.10.0 required.
- npm i --registry=https://registry.npm.taobao.org -g apidoc pm2

## 技术栈

- es6/7/8/9
- koa2
- [sequlize](http://docs.sequelizejs.com/)
- mysql
- [redis](http://redis.cn)
- [joi](https://github.com/hapijs/joi/blob/v13.4.0/API.md)
- [yaml](http://yaml.org/)
- [eslint](https://eslint.org/)
- [apidoc](http://apidocjs.com/)
- casbin

## Installation

```shell
$ npm i --registry=https://registry.npm.taobao.org
```

## Run

```shell
$ npm run dev
```

## Config File

`/config/<env>.yaml`

## Deploy

```shell
$ ./auto-update [分支=master]
```

## Qa

```shell
$ NODE_ENV=qa sh ./auto-update [分支=master]
```
