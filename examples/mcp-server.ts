#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { JimengClient } from "../src";
import dotenv from "dotenv";
import { z } from "zod";
import path from "path";
import fs from "fs";

// 加载环境变量
// 首先尝试从当前目录加载.env文件
dotenv.config();

// 如果环境变量未设置，尝试从用户主目录加载
if (!process.env.JIMENG_ACCESS_KEY || !process.env.JIMENG_SECRET_KEY) {
  const homeEnvPath = path.join(process.env.HOME || process.env.USERPROFILE || "", ".jimengpic", ".env");
  if (fs.existsSync(homeEnvPath)) {
    dotenv.config({ path: homeEnvPath });
  }
}

// 火山引擎即梦AI API配置
const ENDPOINT = "https://visual.volcengineapi.com";
const HOST = "visual.volcengineapi.com";
const SERVICE = "cv";

// 环境变量配置
const JIMENG_ACCESS_KEY = process.env.JIMENG_ACCESS_KEY;
const JIMENG_SECRET_KEY = process.env.JIMENG_SECRET_KEY;

if (!JIMENG_ACCESS_KEY || !JIMENG_SECRET_KEY) {
  console.error("警告：未设置环境变量 JIMENG_ACCESS_KEY 和 JIMENG_SECRET_KEY");
  console.error("服务将启动但无法调用API功能，仅供测试使用");
}

// 图片比例映射
const RATIO_MAPPING: Record<string, { width: number; height: number }> = {
  "4:3": { width: 512, height: 384 },
  "3:4": { width: 384, height: 512 }, 
  "16:9": { width: 512, height: 288 },
  "9:16": { width: 288, height: 512 }
};

// 生成组合后的prompt
function generatePrompt(text: string, illustration: string, color: string): string {
  return `字体设计："${text}"，黑色字体，斜体，带阴影。干净的背景，白色到${color}渐变。点缀浅灰色、半透明${illustration}等元素插图做配饰插画。`;
}

// 创建MCP服务器实例
const server = new McpServer({
  name: "jimeng-ai-mcp",
  version: "1.0.5",
});

// 添加服务器信息资源
server.resource(
  "info",
  "info://server",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `火山引擎即梦AI多模态生成服务 (MCP)\n\n版本: 1.0.4\n状态: ${JIMENG_ACCESS_KEY && JIMENG_SECRET_KEY ? "已配置密钥" : "未配置密钥"}`
    }]
  })
);

// 添加图像生成帮助文档资源
server.resource(
  "help",
  "help://generate-image",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `# generate-image 工具使用帮助\n\n生成图像的工具，可以根据文字、插图元素和颜色生成图像。\n\n## 参数\n\n- text: 用户需要在图片上显示的文字\n- illustration: 根据用户要显示的文字，提取3-5个可以作为图片配饰的插画元素关键词\n- color: 图片的背景主色调\n- ratio: 图片比例。支持: 4:3 (512*384), 3:4 (384*512), 16:9 (512*288), 9:16 (288*512)\n\n## 示例\n\n请使用generate-image工具生成一张图片，图片上显示"创新未来"文字，配饰元素包括科技、星空、光线，背景色调为蓝色，比例为16:9。`
    }]
  })
);

// 添加视频生成帮助文档资源
server.resource(
  "help",
  "help://generate-video",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `# generate-video 工具使用帮助\n\n生成视频的工具，使用即梦AI文生视频模型根据文字提示词生成视频。\n\n## 参数\n\n- prompt: 视频内容的描述\n- async: 是否异步生成视频，true表示立即返回任务ID，false或不填表示等待视频生成完成\n\n## 注意\n\n- 使用模型：jimeng_vgfm_t2v_l20\n- 视频生成耗时较长(1-2分钟)，若遇到超时错误，请使用async=true或使用submit-video-task工具\n\n## 示例\n\n请使用generate-video工具生成一段视频，视频内容为"熊猫在竹林中玩耍"。`
    }]
  })
);

// 添加提交视频任务帮助文档资源
server.resource(
  "help",
  "help://submit-video-task",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `# submit-video-task 工具使用帮助\n\n提交视频生成任务的工具，立即返回任务ID，不等待视频生成完成。\n\n## 参数\n\n- prompt: 视频内容的描述\n\n## 示例\n\n请使用submit-video-task工具提交一个视频生成任务，视频内容为"一只白色的小猪在沙滩上跑动的"。提交后使用get-video-task工具查询结果。`
    }]
  })
);

// 添加查询视频任务帮助文档资源
server.resource(
  "help",
  "help://get-video-task",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `# get-video-task 工具使用帮助\n\n查询视频生成任务的工具，根据任务ID获取视频生成结果。\n\n## 参数\n\n- task_id: 任务ID，通过submit-video-task工具获取\n\n## 示例\n\n请使用get-video-task工具查询任务ID为"12345678901234567890"的视频生成结果。`
    }]
  })
);

// 注册图片生成工具
server.tool(
  "generate-image",
  "当用户需要生成图片时使用的工具",
  {
    text: z.string().describe("用户需要在图片上显示的文字"),
    illustration: z.string().describe("根据用户要显示的文字，提取3-5个可以作为图片配饰的插画元素关键词"),
    color: z.string().describe("图片的背景主色调"),
    ratio: z.enum(["4:3", "3:4", "16:9", "9:16"]).describe("图片比例。支持: 4:3 (512*384), 3:4 (384*512), 16:9 (512*288), 9:16 (288*512)")
  },
  async (args, _extra) => {
    const { text, illustration, color, ratio } = args;
    const imageSize = RATIO_MAPPING[ratio];
    
    if (!imageSize) {
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "不支持的图片比例",
        error: `不支持的比例: ${ratio}`,
        supported_ratios: ["4:3", "3:4", "16:9", "9:16"],
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }

    // 检查API密钥是否配置
    if (!JIMENG_ACCESS_KEY || !JIMENG_SECRET_KEY) {
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "API密钥未配置",
        error: "未设置环境变量 JIMENG_ACCESS_KEY 和 JIMENG_SECRET_KEY",
        help: "请参考文档配置环境变量",
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }

    try {
      // 创建即梦AI客户端
      const client = new JimengClient({
        debug: false // 设置为true可以查看详细日志
      });

      // 生成组合后的prompt
      const prompt = generatePrompt(text, illustration, color);

      // 调用即梦AI生成图像
      const result = await client.generateImage({
        prompt: prompt,
        width: imageSize.width,
        height: imageSize.height,
        region: "cn-north-1"
      });

      if (!result.success || !result.image_urls || result.image_urls.length === 0) {
        // 构建标准JSON格式的失败返回数据
        const failureData = {
          status: "error",
          message: "生成图片失败",
          error: result.error || "未知错误",
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(failureData, null, 2)
            }
          ],
          isError: true
        };
      }

      // 获取LLM优化后的提示词
      const llmPrompt = result.raw_response?.data?.rephraser_result || prompt;

      // 构建符合MCP标准的返回数据，包含JSON格式的结果
      const responseData = {
        status: "success",
        message: "图片生成成功",
        data: {
          text,
          illustration,
          color,
          ratio,
          dimensions: `${imageSize.width}×${imageSize.height}`,
          prompt,
          llm_prompt: llmPrompt,
          image_url: result.image_urls[0]
        },
        timestamp: new Date().toISOString()
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(responseData, null, 2)
          }
        ]
      };
    } catch (error) {
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "生成图片时发生错误",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }
  }
);

// 注册视频生成工具
server.tool(
  "generate-video",
  "当用户需要生成视频时使用的工具，基于即梦AI文生视频模型",
  {
    prompt: z.string().describe("视频内容的描述"),
    async: z.boolean().optional().describe("是否异步生成视频，true表示立即返回任务ID，false或不填表示等待视频生成完成")
  },
  async (args, _extra) => {
    const { prompt, async = false } = args;
    
    // 检查API密钥是否配置
    if (!JIMENG_ACCESS_KEY || !JIMENG_SECRET_KEY) {
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "API密钥未配置",
        error: "未设置环境变量 JIMENG_ACCESS_KEY 和 JIMENG_SECRET_KEY",
        help: "请参考文档配置环境变量",
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }

    try {
      // 创建即梦AI客户端
      const client = new JimengClient({
        debug: false // 设置为true可以查看详细日志
      });

      // 如果是异步模式，只提交任务不等待结果
      if (async) {
        console.log("异步模式：提交视频生成任务...");
        
        // 提交视频生成任务
        const result = await client.submitVideoTask({
          prompt: prompt,
          req_key: "jimeng_vgfm_t2v_l20",
          region: "cn-north-1"
        });
        
        if (!result.success || !result.task_id) {
          console.error("提交视频生成任务失败:", result.error);
          
          // 构建标准JSON格式的失败返回数据
          const failureData = {
            status: "error",
            message: "提交视频生成任务失败",
            error: result.error || "未知错误",
            timestamp: new Date().toISOString()
          };
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(failureData, null, 2)
              }
            ],
            isError: true
          };
        }
        
        // 构建符合MCP标准的返回数据，包含JSON格式的结果
        const responseData = {
          status: "success",
          message: "视频生成任务提交成功",
          data: {
            prompt,
            task_id: result.task_id,
            help: "使用 get-video-task 工具并提供此 task_id 查询结果"
          },
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(responseData, null, 2)
            }
          ]
        };
      }
      
      // 同步模式：提交视频生成任务（一步式方法，内部会处理轮询）
      console.log("同步模式：正在提交视频生成任务并等待结果...");
      
      const result = await client.generateVideo({
        prompt: prompt,
        req_key: "jimeng_vgfm_t2v_l20",
        region: "cn-north-1"
      });
      
      if (!result.success || !result.video_urls || result.video_urls.length === 0) {
        console.error("视频生成失败:", result.error);
        
        // 构建标准JSON格式的失败返回数据
        const failureData = {
          status: "error",
          message: "视频生成失败",
          error: result.error || "未知错误",
          task_id: result.task_id || null,
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(failureData, null, 2)
            }
          ],
          isError: true
        };
      }
      
      // 构建符合MCP标准的返回数据，包含JSON格式的结果
      const responseData = {
        status: "success",
        message: "视频生成成功",
        data: {
          prompt,
          video_url: result.video_urls[0],
          task_id: result.task_id || ""
        },
        timestamp: new Date().toISOString()
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(responseData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("视频生成出错:", error);
      
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "视频生成时发生错误",
        error: error instanceof Error ? error.message : String(error),
        note: "视频生成需要较长时间，如果遇到超时错误，请尝试使用 async=true 参数或使用 submit-video-task 工具",
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }
  }
);

// 注册提交视频任务工具
server.tool(
  "submit-video-task",
  "提交视频生成任务，立即返回任务ID，不等待视频生成完成",
  {
    prompt: z.string().describe("视频内容的描述")
  },
  async (args, _extra) => {
    const { prompt } = args;
    
    // 检查API密钥是否配置
    if (!JIMENG_ACCESS_KEY || !JIMENG_SECRET_KEY) {
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "API密钥未配置",
        error: "未设置环境变量 JIMENG_ACCESS_KEY 和 JIMENG_SECRET_KEY",
        help: "请参考文档配置环境变量",
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }

    try {
      // 创建即梦AI客户端
      const client = new JimengClient({
        debug: false // 设置为true可以查看详细日志
      });

      // 提交视频生成任务
      console.log("提交视频生成任务...");
      
      const result = await client.submitVideoTask({
        prompt: prompt,
        req_key: "jimeng_vgfm_t2v_l20",
        region: "cn-north-1"
      });
      
      if (!result.success || !result.task_id) {
        console.error("提交视频生成任务失败:", result.error);
        
        // 构建标准JSON格式的失败返回数据
        const failureData = {
          status: "error",
          message: "提交视频生成任务失败",
          error: result.error || "未知错误",
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(failureData, null, 2)
            }
          ],
          isError: true
        };
      }
      
      // 构建符合MCP标准的返回数据，包含JSON格式的结果
      const responseData = {
        status: "success",
        message: "视频生成任务提交成功",
        data: {
          prompt,
          task_id: result.task_id,
          help: "使用 get-video-task 工具并提供此 task_id 查询结果"
        },
        timestamp: new Date().toISOString()
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(responseData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("提交视频生成任务出错:", error);
      
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "提交视频生成任务时发生错误",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }
  }
);

// 注册查询视频任务工具
server.tool(
  "get-video-task",
  "查询视频生成任务的结果，根据任务ID获取视频生成结果",
  {
    task_id: z.string().describe("任务ID，通过submit-video-task工具获取")
  },
  async (args, _extra) => {
    const { task_id } = args;
    
    // 检查API密钥是否配置
    if (!JIMENG_ACCESS_KEY || !JIMENG_SECRET_KEY) {
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "API密钥未配置",
        error: "未设置环境变量 JIMENG_ACCESS_KEY 和 JIMENG_SECRET_KEY",
        help: "请参考文档配置环境变量",
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }

    try {
      // 创建即梦AI客户端
      const client = new JimengClient({
        debug: false // 设置为true可以查看详细日志
      });

      // 查询任务结果
      console.log("查询视频生成任务结果...");
      
      const result = await client.getVideoTaskResult(task_id, "jimeng_vgfm_t2v_l20");
      
      if (!result.success) {
        console.error("查询视频生成任务结果失败:", result.error);
        
        // 构建标准JSON格式的失败返回数据
        const failureData = {
          status: "error",
          message: "查询视频生成任务结果失败",
          error: result.error || "未知错误",
          task_id: task_id,
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(failureData, null, 2)
            }
          ],
          isError: true
        };
      }
      
      // 根据任务状态返回不同的结果
      if ((result.status === 'SUCCEEDED' || result.status === 'done') && result.video_urls && result.video_urls.length > 0) {
        // 视频生成成功
        const responseData = {
          status: "success",
          message: "视频生成成功",
          data: {
            status: result.status,
            video_url: result.video_urls[0],
            task_id: task_id
          },
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(responseData, null, 2)
            }
          ]
        };
      } else if (result.status === 'FAILED') {
        // 视频生成失败
        const failureData = {
          status: "error",
          message: "视频生成任务失败",
          data: {
            status: result.status,
            task_id: task_id,
            error: result.error || "视频生成任务失败"
          },
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(failureData, null, 2)
            }
          ],
          isError: true
        };
      } else {
        // 视频生成中
        const pendingData = {
          status: "pending",
          message: "视频生成任务正在进行中",
          data: {
            status: result.status,
            task_id: task_id,
            help: "请稍后再次使用 get-video-task 工具查询结果"
          },
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(pendingData, null, 2)
            }
          ]
        };
      }
    } catch (error) {
      console.error("查询视频生成任务结果出错:", error);
      
      // 构建标准JSON格式的错误返回数据
      const errorData = {
        status: "error",
        message: "查询视频生成任务结果时发生错误",
        error: error instanceof Error ? error.message : String(error),
        task_id: task_id,
        timestamp: new Date().toISOString()
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorData, null, 2)
          }
        ],
        isError: true
      };
    }
  }
);

// 启动服务器的主函数
async function main() {
  try {
    // 添加stdio传输层
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    // 使用JSON格式返回启动成功的信息
    const startupInfo = {
      status: "success",
      message: "即梦AI MCP服务器已启动",
      serverInfo: {
        name: "jimengpic-mcp",
        version: "1.0.5",
        authStatus: JIMENG_ACCESS_KEY && JIMENG_SECRET_KEY ? "configured" : "unconfigured"
      },
      timestamp: new Date().toISOString()
    };
    
    // 打印JSON格式的启动信息
    console.log(JSON.stringify(startupInfo, null, 2));
  } catch (error) {
    // 错误信息也使用JSON格式
    const errorInfo = {
      status: "error",
      message: "MCP服务器启动失败",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
    
    console.error(JSON.stringify(errorInfo, null, 2));
    process.exit(1);
  }
}

// 运行主函数
main(); 