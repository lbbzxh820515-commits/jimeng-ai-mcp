# 火山引擎即梦AI图像生成服务 MCP 项目

## 背景和动机

本项目旨在将火山引擎即梦AI图像生成服务封装为MCP协议服务，使其可以作为AI助手的工具使用。通过MCP协议，AI助手可以直接调用即梦AI的图像生成能力，生成高质量的图像。

## 关键挑战和分析

1. **MCP协议集成**: 需要将即梦AI客户端与MCP协议进行集成，确保符合MCP规范。
2. **环境变量配置**: 需要通过环境变量安全地配置API密钥。
3. **参数优化**: 需要优化图像生成参数，提供合理的默认值和参数校验。
4. **错误处理**: 需要对API调用过程中可能出现的错误进行处理，并返回友好的错误信息。
5. **NPM发布**: 需要准备NPM发布配置，确保包可以正确安装和使用。

## 高层任务拆分

1. ✅ 创建MCP服务配置文件(mcp.json)
2. ✅ 创建MCP服务器文件(examples/mcp-server.ts)
3. ✅ 更新package.json，添加MCP相关依赖和脚本
4. ✅ 更新README.md，添加MCP服务使用说明
5. ✅ 安装依赖
6. ✅ 修复MCP服务器文件中的错误
7. ✅ 编译项目
8. ✅ 准备NPM发布配置
9. ✅ 创建安装和使用指南
10. ✅ 创建NPM发布指南
11. ⬜ 创建.env文件，配置环境变量(用户需要自行配置)
12. ⬜ 测试MCP服务
13. ⬜ 发布到NPM

## 项目状态看板

- [x] 创建MCP服务配置文件(mcp.json)
- [x] 创建MCP服务器文件(examples/mcp-server.ts)
- [x] 更新package.json，添加MCP相关依赖和脚本
- [x] 更新README.md，添加MCP服务使用说明
- [x] 安装依赖
- [x] 修复MCP服务器文件中的错误
- [x] 编译项目
- [x] 准备NPM发布配置
- [x] 创建安装和使用指南(INSTALLATION.md)
- [x] 创建NPM发布指南(PUBLISHING.md)
- [ ] 创建.env文件，配置环境变量(用户需要自行配置)
- [ ] 测试MCP服务
- [ ] 发布到NPM

## 当前状态/进度跟踪

已完成MCP服务的基本配置和实现，并准备好NPM发布所需的配置：
1. 创建了MCP服务配置文件(mcp.json)
2. 创建了MCP服务器文件(examples/mcp-server.ts)
3. 更新了package.json，添加了MCP相关依赖和脚本
4. 更新了README.md，添加了MCP服务使用说明
5. 安装了依赖
6. 修复了MCP服务器文件中的错误
7. 成功编译了项目
8. 准备了NPM发布配置
9. 创建了安装和使用指南(INSTALLATION.md)
10. 创建了NPM发布指南(PUBLISHING.md)

下一步需要测试MCP服务的功能，并发布到NPM。用户需要自行创建.env文件，配置环境变量。

## 执行者反馈或请求帮助

MCP服务已经配置完成并准备好发布到NPM，但需要用户提供火山引擎即梦AI的访问密钥才能正常使用。用户需要创建.env文件，并设置以下环境变量：

```
JIMENG_ACCESS_KEY=你的火山引擎访问密钥
JIMENG_SECRET_KEY=你的火山引擎密钥
```

完成后，可以使用以下命令启动MCP服务：

```bash
# 启动MCP服务
npm start

# 或者以开发模式启动
npm run dev
```

要发布到NPM，请按照PUBLISHING.md中的指南操作。

## 经验教训

1. MCP SDK的包名是`@modelcontextprotocol/sdk`，最新版本是^1.12.3。
2. 环境变量文件(.env)通常被全局忽略，需要创建.env.example文件作为示例。
3. MCP服务需要使用StdioServerTransport进行通信。
4. MCP工具参数需要使用zod进行类型定义和验证。
5. 发布NPM包时，需要确保package.json中的配置正确，特别是name、version、main、bin和files字段。
6. 可执行文件需要添加shebang(`#!/usr/bin/env node`)并设置可执行权限。 