/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-17 10:03:29
 */
/** 内建模块 */
import fs from 'fs'
import path from 'path'

/** 第三方模块 */
import chalk from 'chalk'
import yaml from 'js-yaml'
import Log from './logger'

/** 基础模块 */

/** 项目模块 */

const constFilePath = path.join(__dirname, '../data/const.yaml')
const respCodeFilePath = path.join(__dirname, '../data/respCode.yaml')
const mimeFilePath = path.join(__dirname, '../data/mime.yaml')
export const yamlCheck = () => {
  try {
    /* 读取常量文件 */
    yaml.safeLoad(fs.readFileSync(constFilePath))
    /* 读取响应码文件 */
    yaml.safeLoad(fs.readFileSync(respCodeFilePath))
    /* 读取文件类型文件 */
    yaml.safeLoad(fs.readFileSync(mimeFilePath))

    Log.logger(null, '常量文件  : ', chalk.cyan(`${constFilePath}`))
    Log.logger(null, '响应码文件: ', chalk.cyan(`${respCodeFilePath}`))
    Log.logger(null, '响应码文件: ', chalk.cyan(`${mimeFilePath}`))
  } catch (ex) {
    Log.logger(ex, 'yaml文件检测未通过, 原因: ', ex)
  }
}

// 加载常量
const loadConst = () => {
  try {
    const constFile = fs.readFileSync(constFilePath)
    return yaml.safeLoad(constFile)
  } catch (e) {
    Log.logger(e, '加载常量失败, 原因: ', e)
    return {}
  }
}
export const CONST = loadConst()

// 加载响应码
const loadRespCode = () => {
  try {
    const respCodeFile = fs.readFileSync(respCodeFilePath)
    return yaml.safeLoad(respCodeFile)
  } catch (e) {
    Log.logger(e, '加载响应码失败, 原因: ', e)
    return {}
  }
}
export const RESPCODE = loadRespCode()

// 加载文件类型
const loadMime = () => {
  try {
    const respCodeFile = fs.readFileSync(mimeFilePath)
    return yaml.safeLoad(respCodeFile)
  } catch (e) {
    Log.logger(e, '加载文件类型失败, 原因: ', e)
    return {}
  }
}
export const MIME = loadMime()
