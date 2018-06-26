/** 内建模块 */
import fs from 'fs';
import path from 'path';

/** 第三方模块 */
import yaml from 'js-yaml';
import colors from 'colors/safe';
import logger from './logger';

/** 基础模块 */

/** 项目模块 */


const YamlCC = () => {
  const yamlData = {};
  let constFilePath = '../const.yaml';

  constFilePath = path.join(__dirname, constFilePath);

  logger(null, '常量文件路径：', colors.cyan(`${constFilePath}`));

  /* 读取常量文件 */
  const constData = fs.readFileSync(constFilePath);
  yamlData.const = yaml.load(constData);

  return yamlData;
};

export default YamlCC();
