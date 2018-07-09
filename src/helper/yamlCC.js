/** 内建模块 */
import fs from 'fs';
import path from 'path';

/** 第三方模块 */
import yaml from 'js-yaml';
import chalk from 'chalk';
import logger from './logger';

/** 基础模块 */

/** 项目模块 */


export const check = () => {
  try {
    let constFilePath = '../const.yaml';
    constFilePath = path.join(__dirname, constFilePath);

    /* 读取常量文件 */
    const constFile = fs.readFileSync(constFilePath);
    yaml.safeLoad(constFile);

    logger(null, '常量文件  ：', chalk.cyan(`${constFilePath}`));
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
    logger(e, '常量加载失败，原因：', e);
    return {};
  }
};
export const PRIVILEGE = loadPrivilege();
