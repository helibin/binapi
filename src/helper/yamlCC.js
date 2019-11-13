/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-23 20:43:13
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

export const yamlCheck = () => {
  try {
    const constFilePath = path.join(__dirname, '../data/const.yaml')
    const privilegeFilePath = path.join(__dirname, '../data/privilege.yaml')
    const respCodeFilePath = path.join(__dirname, '../data/respCode.yaml')

    /* 读取常量文件 */
    yaml.safeLoad(fs.readFileSync(constFilePath))
    /* 读取权限文件 */
    yaml.safeLoad(fs.readFileSync(privilegeFilePath))
    /* 读取响应码文件 */
    yaml.safeLoad(fs.readFileSync(respCodeFilePath))

    Log.logger(null, '常量文件  ：', chalk.cyan(`${constFilePath}`))
    Log.logger(null, '权限文件  ：', chalk.cyan(`${privilegeFilePath}`))
    Log.logger(null, '响应码文件：', chalk.cyan(`${respCodeFilePath}`))
  } catch (ex) {
    Log.logger(ex, 'yaml文件检测未通过, 原因：', ex)
  }
}

// 加载常量
const loadConst = () => {
  try {
    let constFilePath = '../data/const.yaml'
    constFilePath = path.join(__dirname, constFilePath)

    const constFile = fs.readFileSync(constFilePath)
    return yaml.safeLoad(constFile)
  } catch (e) {
    Log.logger(e, '常量加载失败, 原因：', e)
    return {}
  }
}
export const CONST = loadConst()

// 加载权限
const loadPrivilege = () => {
  try {
    let privilegeFilePath = '../data/privilege.yaml'
    privilegeFilePath = path.join(__dirname, privilegeFilePath)

    const privilegeFile = fs.readFileSync(privilegeFilePath)
    return yaml.safeLoad(privilegeFile)
  } catch (e) {
    Log.logger(e, '权限加载失败, 原因：', e)
    return {}
  }
}
export const PRIVILEGE = loadPrivilege()

// 加载响应码
const loadRespCode = () => {
  try {
    let respCodeFilePath = '../data/respCode.yaml'
    respCodeFilePath = path.join(__dirname, respCodeFilePath)

    const respCodeFile = fs.readFileSync(respCodeFilePath)
    return yaml.safeLoad(respCodeFile)
  } catch (e) {
    Log.logger(e, '响应码加载失败, 原因：', e)
    return {}
  }
}
export const RESPCODE = loadRespCode()
