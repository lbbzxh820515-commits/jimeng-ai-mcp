/**
 * 火山引擎即梦AI图像生成示例
 * 
 * 使用方法:
 * 1. 设置环境变量:
 *    export JIMENG_ACCESS_KEY=你的访问密钥
 *    export JIMENG_SECRET_KEY=你的密钥
 * 
 * 2. 运行示例:
 *    npx ts-node examples/jimeng-image-generator.ts "一只可爱的熊猫"
 * 
 * 注:
 * - 默认使用区域: cn-north-1
 */

import { JimengClient } from '../src';
import * as dotenv from 'dotenv';
dotenv.config();

// 命令行参数处理
const rawArgs = process.argv.slice(2);
const positionalArgs: string[] = [];
let modelKey: string | undefined;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  if (arg === '--model' && i + 1 < rawArgs.length) {
    modelKey = rawArgs[i + 1];
    i++;
    continue;
  }

  if (arg.startsWith('--model=')) {
    modelKey = arg.substring('--model='.length);
    continue;
  }

  positionalArgs.push(arg);
}

const prompt = positionalArgs[0] || '一只可爱的熊猫，坐在竹林中，吃着竹子，阳光照射，高清细节，写实风格';
const width = parseInt(positionalArgs[1] || '2048', 10);
const height = parseInt(positionalArgs[2] || '2048', 10);
const watermarkText = positionalArgs[3];

if (!modelKey && positionalArgs.length > 4) {
  modelKey = positionalArgs[4];
}

// 检查环境变量
if (!process.env.JIMENG_ACCESS_KEY || !process.env.JIMENG_SECRET_KEY) {
  console.error('错误: 需要设置环境变量 JIMENG_ACCESS_KEY 和 JIMENG_SECRET_KEY');
  console.error('请设置以下环境变量:');
  console.error('export JIMENG_ACCESS_KEY=你的访问密钥');
  console.error('export JIMENG_SECRET_KEY=你的密钥');
  process.exit(1);
}

// 默认区域
const DEFAULT_REGION = 'cn-north-1';

async function main() {
  try {
    console.log('即梦AI图像生成示例');
    console.log('-------------------');
    console.log('提示词:', prompt);
    console.log('图像尺寸:', `${width}x${height}`);
    console.log('模型:', modelKey || 'jimeng_t2i_v40 (默认)');
    if (watermarkText) {
      console.log('自定义水印文本:', watermarkText);
    }
    console.log('区域:', DEFAULT_REGION);
    
    // 创建客户端实例
    const client = new JimengClient({
      debug: true, // 设置为true可以查看详细日志
    });

    console.log('\n正在生成图像，请稍候...');

    // 生成图像
    const startTime = Date.now();
    const result = await client.generateImage({
      prompt: prompt,
      width: width,
      height: height,
      force_single: true,
      region: DEFAULT_REGION,
      req_key: modelKey,
      logo_info: watermarkText
        ? {
            add_logo: true,
            position: 0,
            language: 0,
            opacity: 1,
            logo_text_content: watermarkText
          }
        : undefined
    });
    const endTime = Date.now();

    console.log(`生成耗时: ${(endTime - startTime) / 1000}秒`);

    if (result.success && result.image_urls && result.image_urls.length > 0) {
      console.log('\n图像生成成功!');
      if (result.task_id) {
        console.log('任务ID:', result.task_id);
      }
      if (result.status) {
        console.log('最终状态:', result.status);
      }
      console.log('图像URL:');
      result.image_urls.forEach((url, index) => {
        console.log(`[${index + 1}] ${url}`);
      });

      // 如果有LLM优化后的提示词，显示出来
      if (result.raw_response?.data?.rephraser_result) {
        console.log('\nLLM优化后的提示词:');
        console.log(result.raw_response.data.rephraser_result);
      }
    } else if (result.success && result.binary_data_base64 && result.binary_data_base64.length > 0) {
      console.log('\n图像生成成功! 收到Base64图像数据，可手动保存到文件。');
      if (result.task_id) {
        console.log('任务ID:', result.task_id);
      }
      if (result.status) {
        console.log('最终状态:', result.status);
      }
      result.binary_data_base64.forEach((item, index) => {
        console.log(`[${index + 1}] Base64长度: ${item.length}`);
      });
    } else {
      console.error('\n图像生成失败:', result.error);
    }
  } catch (error) {
    console.error('\n发生错误:', error instanceof Error ? error.message : String(error));
  }
}

// 运行主函数
main(); 