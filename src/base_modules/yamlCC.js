/** 内建模块 */
import fs from 'fs';
import path from 'path';

/** 第三方模块 */
import yaml from 'js-yaml';
import colors from 'colors';
import logger from './logger';

/** 基础模块 */

/** 项目模块 */

const YamlCC = {};

YamlCC.check = () => {
  try {
    let constFilePath = '../const.yaml';
    constFilePath = path.join(__dirname, constFilePath);

    /* 读取常量文件 */
    const constFile = fs.readFileSync(constFilePath);
    yaml.safeLoad(constFile);

    logger(null, '常量文件  ：', colors.cyan(`${constFilePath}`));
  } catch (e) {
    logger(e, '常量检测未通过，原因：', e);
  }
};

YamlCC.CONST = () => {
  let CONST = {};

  try {
    let constFilePath = '../const.yaml';
    constFilePath = path.join(__dirname, constFilePath);

    const constFile = fs.readFileSync(constFilePath);
    CONST = yaml.safeLoad(constFile);
  } catch (e) {
    logger(e, '常量加载失败，原因：', e);
  }

  return CONST;
};

export default YamlCC;
export const CONST = YamlCC.CONST();
