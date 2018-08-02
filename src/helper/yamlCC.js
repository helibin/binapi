/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 14:43:50
 */
/** 内建模块 */
import fs from 'fs';
import path from 'path';

/** 第三方模块 */
import chalk from 'chalk';
import yaml from 'js-yaml';
import { logger } from './logger';

/** 基础模块 */

/** 项目模块 */


export const yamlCheck = () => {
  try {
    const constFilePath = path.join(__dirname, '../const.yaml');
    const privilegeFilePath = path.join(__dirname, '../privilege.yaml');

    /* 读取常量文件 */
    yaml.safeLoad(fs.readFileSync(constFilePath));
    /* 读取权限文件 */
    yaml.safeLoad(fs.readFileSync(privilegeFilePath));

    logger(null, '常量文件  ：', chalk.cyan(`${constFilePath}`));
    logger(null, '权限文件  ：', chalk.cyan(`${privilegeFilePath}`));
  } catch (e) {
    logger(e, '常量检测未通过，原因：', e);
  }
};

// 加载常量
const loadConst = () => {
  try {
    let constFilePath = '../const.yaml';
    constFilePath = path.join(__dirname, constFilePath);

    const constFile = fs.readFileSync(constFilePath);
    return yaml.safeLoad(constFile);
  } catch (e) {
    logger(e, '常量加载失败，原因：', e);
    return {};
  }
};
export const CONST = loadConst();

// 加载权限
const loadPrivilege = () => {
  try {
    let privilegeFilePath = '../privilege.yaml';
    privilegeFilePath = path.join(__dirname, privilegeFilePath);

    const privilegeFile = fs.readFileSync(privilegeFilePath);
    return yaml.safeLoad(privilegeFile);
  } catch (e) {
    logger(e, '权限加载失败，原因：', e);
    return {};
  }
};
export const PRIVILEGE = loadPrivilege();
