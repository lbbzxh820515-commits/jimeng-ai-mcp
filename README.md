# 即梦AI多模态MCP

这是一个基于火山引擎即梦AI的多模态生成服务，支持图像生成、视频生成等功能，可通过MCP协议在Cursor、Claude Desktop等MCP客户端中使用，也可作为独立库调用。支持 macOS、Linux、Windows 及 WSL 环境。

## 版本更新

### v1.0.4
- 优化服务启动和响应返回，现在所有响应均使用标准JSON格式
- 统一错误处理和成功响应的数据结构
- 增强错误信息的可读性和可解析性

## 核心功能

- ✅ **文生图** - 通过文本描述生成高质量图像 (模型: jimeng_t2i_s20pro)
- ✅ **文生视频** - 将文本描述转换为流畅视频 (模型: jimeng_vgfm_t2v_l20)
- ✅ **图生视频** - 将静态图像转换为动态视频 (模型: jimeng_vgfm_i2v_l20)
- ✅ **多平台支持** - 支持 macOS、Linux、Windows 及 WSL 环境
- 🛠️ 完整TypeScript类型定义和错误处理
- 🔄 支持异步任务处理和状态追踪
- 🎛️ 自定义参数控制 (尺寸、比例、帧数等)

## 快速开始

### 安装

#### macOS/Linux

```bash
# NPM全局安装
npm install -g jimeng-ai-mcp

# 或本地安装
git clone https://github.com/freeleepm/jimeng-ai-mcp.git
cd jimeng-mcp
npm install
npm run build
```

#### Windows

```cmd
# NPM全局安装
npm install -g jimeng-ai-mcp

# 或本地安装
git clone https://github.com/freeleepm/jimeng-ai-mcp.git
cd jimeng-mcp
npm install
npm run build
```

### 环境变量配置

在使用前，需设置火山引擎即梦AI服务的访问密钥：

#### macOS/Linux

```bash
# 设置环境变量
export JIMENG_ACCESS_KEY=你的火山引擎访问密钥
export JIMENG_SECRET_KEY=你的火山引擎密钥

# 或创建.env文件
echo "JIMENG_ACCESS_KEY=你的火山引擎访问密钥" > .env
echo "JIMENG_SECRET_KEY=你的火山引擎密钥" >> .env
```

#### Windows

```cmd
# 设置环境变量
set JIMENG_ACCESS_KEY=你的火山引擎访问密钥
set JIMENG_SECRET_KEY=你的火山引擎密钥

# 或创建.env文件
echo JIMENG_ACCESS_KEY=你的火山引擎访问密钥 > .env
echo JIMENG_SECRET_KEY=你的火山引擎密钥 >> .env

# 或永久设置环境变量（管理员命令提示符）
setx JIMENG_ACCESS_KEY "你的火山引擎访问密钥"
setx JIMENG_SECRET_KEY "你的火山引擎密钥"
```

## MCP客户端配置

### Cursor配置

#### macOS/Linux

在Cursor配置目录中创建`mcp-config.json`文件：

```json
{
  "mcpServers": {
    "jimeng": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "jimeng-ai-mcp"
      ],
      "env": {
        "JIMENG_ACCESS_KEY": "你的火山引擎访问密钥",
        "JIMENG_SECRET_KEY": "你的火山引擎密钥"
      }
    }
  }
}
```

#### Windows

在Cursor配置目录中创建`mcp-config.json`文件：

```json
{
  "mcpServers": {
    "jimeng": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "jimeng-ai-mcp"
      ],
      "env": {
        "JIMENG_ACCESS_KEY": "你的火山引擎访问密钥",
        "JIMENG_SECRET_KEY": "你的火山引擎密钥"
      }
    }
  }
}
```

#### WSL (Windows Subsystem for Linux)

在Cursor配置目录中创建`mcp-config.json`文件：

```json
{
  "mcpServers": {
    "jimeng": {
      "type": "stdio",
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "jimeng-ai-mcp"
      ],
      "env": {
        "JIMENG_ACCESS_KEY": "你的火山引擎访问密钥",
        "JIMENG_SECRET_KEY": "你的火山引擎密钥"
      }
    }
  }
}
```

### Claude Desktop配置

#### macOS/Linux

在Claude Desktop的配置文件`claude_desktop_config.json`中添加：

```json
{
  "mcpServers": {
    "jimeng": {
      "command": "npx",
      "args": [
        "-y",
        "jimeng-ai-mcp"
      ],
      "env": {
        "JIMENG_ACCESS_KEY": "你的火山引擎访问密钥",
        "JIMENG_SECRET_KEY": "你的火山引擎密钥"
      }
    }
  }
}
```

#### Windows

在Claude Desktop的配置文件`claude_desktop_config.json`中添加：

```json
{
  "mcpServers": {
    "jimeng": {
      "command": "npx",
      "args": [
        "-y",
        "jimeng-ai-mcp"
      ],
      "env": {
        "JIMENG_ACCESS_KEY": "你的火山引擎访问密钥",
        "JIMENG_SECRET_KEY": "你的火山引擎密钥"
      }
    }
  }
}
```

#### WSL (Windows Subsystem for Linux)

在Claude Desktop的配置文件`claude_desktop_config.json`中添加：

```json
{
  "mcpServers": {
    "jimeng": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "jimeng-ai-mcp"
      ],
      "env": {
        "JIMENG_ACCESS_KEY": "你的火山引擎访问密钥",
        "JIMENG_SECRET_KEY": "你的火山引擎密钥"
      }
    }
  }
}
```

> 注意：在 Windows 环境下，您可能需要根据实际安装路径调整命令。在 WSL 环境中，使用 cmd /c 前缀可以确保命令正确执行。
```

## MCP工具使用

### generate-image

生成图像的工具，根据文字提示生成图像。

**参数**：
- `text`: 要在图片上显示的文字
- `illustration`: 作为图片配饰的插画元素关键词
- `color`: 图片的背景主色调
- `ratio`: 图片比例，支持: 4:3 (512×384), 3:4 (384×512), 16:9 (512×288), 9:16 (288×512)

**示例**：
```
请使用generate-image工具生成一张图片，图片上显示"创新未来"文字，配饰元素包括科技、星空、光线，背景色调为蓝色，比例为16:9。
```

### generate-video

生成视频的工具，使用即梦AI文生视频模型。

**参数**：
- `prompt`: 视频内容的描述
- `num_frames`: 视频帧数 (可选，默认16)
- `fps`: 视频帧率 (可选，默认8)

**示例**：
```
请使用generate-video工具生成一段视频，视频内容为"熊猫在竹林中玩耍"，帧数为16。
```

### generate-image-to-video

图生视频工具，将静态图片转换为动态视频。

**参数**：
- `image_urls`: 输入图片URL数组 (JPEG/PNG格式)
- `prompt`: 动画效果描述 (可选)
- `aspect_ratio`: 视频比例 (可选，如"16:9"、"4:3"等，默认"16:9")
- `num_frames`: 视频帧数 (可选，默认16)
- `fps`: 视频帧率 (可选，默认8)

**示例**：
```
请使用generate-image-to-video工具生成视频，输入图片为https://example.com/image.jpg，效果为"波浪摇曳"，比例为"16:9"。
```

## 作为客户端库使用

### 基本用法

```typescript
import { JimengClient } from 'jimeng-ai-mcp';

// 创建客户端实例
const client = new JimengClient({
  accessKey: 'YOUR_ACCESS_KEY',
  secretKey: 'YOUR_SECRET_KEY',
  region: 'cn-beijing', // 默认区域
  debug: false // 设置为true可以查看详细日志
});

// 文生图示例
async function generateImage() {
  const result = await client.generateImage({
    prompt: "一只可爱的猫咪在草地上玩耍",
    width: 512,
    height: 512
  });
  
  if (result.success && result.image_urls && result.image_urls.length > 0) {
    console.log('图像URL:', result.image_urls[0]);
  } else {
    console.error('生成失败:', result.error);
  }
}

// 文生视频示例
async function generateVideo() {
  const result = await client.generateVideo({
    prompt: "一只可爱的猫咪在草地上玩耍"
  });
  
  if (result.success && result.video_urls && result.video_urls.length > 0) {
    console.log('视频URL:', result.video_urls[0]);
  } else {
    console.error('生成失败:', result.error);
  }
}

// 图生视频示例
async function generateImageToVideo() {
  const result = await client.generateImageToVideo({
    image_urls: ["https://example.com/image.jpg"],
    prompt: "波浪效果",
    aspect_ratio: "16:9"
  });
  
  if (result.success && result.video_urls && result.video_urls.length > 0) {
    console.log('视频URL:', result.video_urls[0]);
  } else {
    console.error('生成失败:', result.error);
  }
}
```

### 高级用法：异步任务处理

对于耗时较长的视频生成任务，可以使用异步方式：

```typescript
// 文生视频异步方式
async function generateVideoAsync() {
  // 提交任务
  const taskResult = await client.submitVideoTask({
    prompt: "一只可爱的猫咪在草地上玩耍",
    req_key: "jimeng_vgfm_t2v_l20"
  });
  
  console.log('任务ID:', taskResult.task_id);
  
  // 轮询任务结果
  let result;
  do {
    // 等待60秒再查询（符合API限制）
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // 查询任务结果
    result = await client.getVideoTaskResult(taskResult.task_id);
    console.log('任务状态:', result.status);
    
  } while (result.status === 'PENDING' || result.status === 'RUNNING');
  
  if (result.success && result.status === 'SUCCEEDED') {
    console.log('视频URL:', result.video_urls);
  } else {
    console.error('生成失败:', result.error);
  }
}

// 图生视频异步方式
async function generateImageToVideoAsync() {
  // 提交任务
  const taskResult = await client.submitI2VTask({
    image_urls: ["https://example.com/image.jpg"],
    prompt: "波浪效果",
    req_key: "jimeng_vgfm_i2v_l20"
  });
  
  console.log('任务ID:', taskResult.task_id);
  
  // 查询任务结果（简化示例，实际应用需要轮询）
  const result = await client.getVideoTaskResult(taskResult.task_id, "jimeng_vgfm_i2v_l20");
  
  if (result.success && result.status === 'SUCCEEDED') {
    console.log('视频URL:', result.video_urls);
  }
}
```

## Docker部署

创建以下Dockerfile：

```dockerfile
FROM node:16-alpine

RUN npm install -g jimeng-ai-mcp

ENV JIMENG_ACCESS_KEY=你的火山引擎访问密钥
ENV JIMENG_SECRET_KEY=你的火山引擎密钥

CMD ["jimeng-ai-mcp"]
```

构建并运行：

```bash
docker build -t jimeng-ai-mcp .
docker run -i --rm jimeng-ai-mcp
```

## 开发指南

### 本地开发

```bash
# 开发模式启动
npm run dev

# 构建
npm run build

# 测试
npm test

# 运行
npm start
```

### 发布NPM包

```bash
# 更新版本号
npm version patch|minor|major

# 构建项目
npm run build

# 发布
npm publish
```

## 故障排除

### 常见问题

1. **认证失败**：检查JIMENG_ACCESS_KEY和JIMENG_SECRET_KEY是否正确。

2. **图像格式不支持**：确保使用JPEG/PNG格式的图片，且URL可公开访问。

3. **QPS限制**：API有QPS=1的限制，多次调用时需间隔60秒。

4. **内容安全检查**：确保生成内容符合平台内容政策。

### 错误码列表

- `ERR_AUTH_FAILED`: 认证失败，检查访问密钥
- `ERR_TASK_FAILED`: 任务失败，查看详细错误信息
- `ERR_INVALID_PARAM`: 参数无效，检查输入参数
- `ERR_NETWORK`: 网络错误，检查网络连接
- `ERR_SERVER`: 服务器错误，稍后重试

## 贡献与支持

欢迎提交问题和拉取请求！如有问题，请通过GitHub Issues反馈。

## 许可证

MIT 