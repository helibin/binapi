'use strict'

/** 内建模块 */
import fs from 'fs'
import path from 'path'

/** 第三方模块 */
import yaml from 'js-yaml'
import colors from 'colors/safe'

/** 基础模块 */
import * as t from './tools'

/** 项目模块 */



let loadFile = () => {
  let yamlData = {}
  let constFilePath = '../const.yaml'

  constFilePath = path.join(__dirname, constFilePath)

  console.log('常量文件路径：', colors.cyan(`${constFilePath}`))

  /* 读取常量文件 */
  let constData = fs.readFileSync(constFilePath)
  yamlData.const = yaml.load(constData)

  return yamlData
}

export default loadFile()
