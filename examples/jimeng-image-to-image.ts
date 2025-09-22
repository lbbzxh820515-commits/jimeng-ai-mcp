/**
 * 即梦AI 图生图示例脚本
 *
 * 使用方法:
 *   npx ts-node examples/jimeng-image-to-image.ts "提示词" /abs/path/reference.png [更多参考图]
 *
 * 可选参数:
 *   --model <req_key>     指定模型，例如 jimeng_t2i_v40
 *   --width <value>       输出宽度
 *   --height <value>      输出高度
 *   --size <value>        输出面积，单位像素^2
 *   --region <value>      指定区域，默认为 cn-north-1
 *   --no-return-url       仅返回 Base64，关闭 URL 输出
 */

import { JimengClient } from '../src';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const rawArgs = process.argv.slice(2);
const positionalArgs: string[] = [];
let modelKey: string | undefined;
let widthValue: number | undefined;
let heightValue: number | undefined;
let sizeValue: number | undefined;
let region = 'cn-north-1';
let returnUrl = true;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  if (arg === '--model' && i + 1 < rawArgs.length) {
    modelKey = rawArgs[++i];
    continue;
  }
  if (arg.startsWith('--model=')) {
    modelKey = arg.substring('--model='.length);
    continue;
  }

  if (arg === '--width' && i + 1 < rawArgs.length) {
    widthValue = parseInt(rawArgs[++i], 10);
    continue;
  }
  if (arg.startsWith('--width=')) {
    widthValue = parseInt(arg.substring('--width='.length), 10);
    continue;
  }

  if (arg === '--height' && i + 1 < rawArgs.length) {
    heightValue = parseInt(rawArgs[++i], 10);
    continue;
  }
  if (arg.startsWith('--height=')) {
    heightValue = parseInt(arg.substring('--height='.length), 10);
    continue;
  }

  if (arg === '--size' && i + 1 < rawArgs.length) {
    sizeValue = parseInt(rawArgs[++i], 10);
    continue;
  }
  if (arg.startsWith('--size=')) {
    sizeValue = parseInt(arg.substring('--size='.length), 10);
    continue;
  }

  if (arg === '--region' && i + 1 < rawArgs.length) {
    region = rawArgs[++i];
    continue;
  }
  if (arg.startsWith('--region=')) {
    region = arg.substring('--region='.length);
    continue;
  }

  if (arg === '--no-return-url') {
    returnUrl = false;
    continue;
  }

  positionalArgs.push(arg);
}

const prompt = positionalArgs.shift();
const referenceInputs = positionalArgs;

if (!prompt) {
  console.error('错误: 需要提供提示词，例如 "修复参考图"');
  process.exit(1);
}

if (referenceInputs.length === 0) {
  console.error('错误: 需要至少提供一张参考图片 (本地绝对路径或URL)');
  process.exit(1);
}

if (!process.env.JIMENG_ACCESS_KEY || !process.env.JIMENG_SECRET_KEY) {
  console.error('错误: 需要设置环境变量 JIMENG_ACCESS_KEY 和 JIMENG_SECRET_KEY');
  process.exit(1);
}

const localReferences: string[] = [];
const remoteReferences: string[] = [];

for (const item of referenceInputs) {
  if (/^https?:\/\//i.test(item)) {
    remoteReferences.push(item);
  } else {
    const resolved = path.isAbsolute(item) ? item : path.resolve(process.cwd(), item);
    if (!fs.existsSync(resolved)) {
      console.error(`错误: 本地图片不存在 -> ${resolved}`);
      process.exit(1);
    }
    localReferences.push(resolved);
  }
}

(async () => {
  try {
    console.log('即梦AI 图生图示例');
    console.log('-------------------');
    console.log('提示词:', prompt);
    console.log('模型:', modelKey || 'jimeng_t2i_v40 (默认)');
    console.log('区域:', region);
    if (typeof widthValue === 'number' && typeof heightValue === 'number') {
      console.log('输出尺寸:', `${widthValue}x${heightValue}`);
    } else if (typeof sizeValue === 'number') {
      console.log('输出面积:', sizeValue);
    }
    console.log('参考图数量:', referenceInputs.length);
    if (localReferences.length > 0) {
      console.log('本地参考图:');
      localReferences.forEach((item, index) => {
        console.log(`  [${index + 1}] ${item}`);
      });
    }
    if (remoteReferences.length > 0) {
      console.log('远程参考图:');
      remoteReferences.forEach((item, index) => {
        console.log(`  [${index + 1}] ${item}`);
      });
    }

    const client = new JimengClient({ debug: true });

    const startTime = Date.now();
    const result = await client.generateImage({
      prompt,
      req_key: modelKey,
      width: widthValue,
      height: heightValue,
      size: sizeValue,
      region,
      return_url: returnUrl,
      image_urls: remoteReferences.length > 0 ? remoteReferences : undefined,
      image_paths: localReferences.length > 0 ? localReferences : undefined,
      force_single: false
    });
    const endTime = Date.now();

    console.log(`生成耗时: ${(endTime - startTime) / 1000}秒`);

    if (!result.success) {
      console.error('生成失败:', result.error || '未知错误');
      process.exit(1);
    }

    if (result.image_urls && result.image_urls.length > 0) {
      console.log('生成图像 URL:');
      result.image_urls.forEach((url, index) => {
        console.log(`  [${index + 1}] ${url}`);
      });
    }

    if (result.binary_data_base64 && result.binary_data_base64.length > 0) {
      console.log('生成图像 Base64 列表:');
      result.binary_data_base64.forEach((item, index) => {
        console.log(`  [${index + 1}] 长度 ${item.length}`);
      });
    }

    if (result.raw_response) {
      console.log('原始响应片段:');
      console.log(JSON.stringify(result.raw_response, null, 2));
    }
  } catch (error) {
    console.error('发生异常:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();
