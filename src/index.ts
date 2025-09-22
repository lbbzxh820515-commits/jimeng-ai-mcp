import axios from 'axios';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const fsPromises = fs.promises;

/**
 * 调试日志函数，确保所有日志只输出到 stderr
 */
function debugLog(...args: any[]) {
  if (process.stderr && process.stderr.write) {
    process.stderr.write(args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)).join(' ') + '\n');
  }
}

/**
 * 即梦AI客户端配置
 */
export interface JimengClientConfig {
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
  host?: string;
  region?: string;
  service?: string;
  debug?: boolean;
  timeout?: number;
  retries?: number;
}

/**
 * 图像生成参数
 */
export interface ImageLogoInfo {
  add_logo?: boolean;
  position?: number;
  language?: number;
  opacity?: number;
  logo_text_content?: string;
}

export interface GenerateImageParams {
  prompt: string;
  negative_prompt?: string;
  image_urls?: string[];
  image_path?: string;
  image_paths?: string[];
  size?: number;
  width?: number;
  height?: number;
  return_url?: boolean;
  req_key?: string;
  region?: string;
  scale?: number;
  force_single?: boolean;
  min_ratio?: number;
  max_ratio?: number;
  seed?: number;
  logo_info?: ImageLogoInfo;
  req_json?: Record<string, any> | string;
  pollingIntervalMs?: number;
  maxPollAttempts?: number;
  auto_upload?: boolean;
}

/**
 * 图像生成响应
 */
export interface GenerateImageResponse {
  success: boolean;
  image_urls?: string[];
  binary_data_base64?: string[];
  error?: string;
  raw_response?: any;
  task_id?: string;
  status?: string;
}

/**
 * 图像生成任务提交响应
 */
export interface ImageTaskSubmitResponse {
  success: boolean;
  task_id?: string;
  error?: string;
  raw_response?: any;
}

/**
 * 图像生成任务结果响应
 */
export interface ImageTaskResultResponse {
  success: boolean;
  status?: string;
  status_raw?: string;
  image_urls?: string[];
  binary_data_base64?: string[];
  error?: string;
  raw_response?: any;
}

export interface UploadImageParams {
  paths: string[];
  region?: string;
  action?: string;
  version?: string;
}

export interface UploadImageResponse {
  success: boolean;
  image_urls?: string[];
  raw_response?: any;
  error?: string;
}

/**
 * 视频生成参数 - 文生视频
 */
export interface GenerateVideoParams {
  prompt: string;  // 视频内容描述，必需参数
  req_key?: string;  // 模型标识符，可选，默认为"jimeng_vgfm_t2v_l22"
  region?: string;  // 区域，可选，默认为"cn-north-1"
  negative_prompt?: string; // 反向提示词
  duration?: number; // 视频时长，单位秒
  video_num?: number; // 生成视频数量
  frame_rate?: number; // 帧率
  aspect_ratio?: string; // 长宽比
  width?: number; // 指定宽度
  height?: number; // 指定高度
  resolution?: string; // 预设分辨率
  cfg_scale?: number; // 文本引导系数
  seed?: number; // 随机种子
  motion_strength?: number; // 动作强度
  music?: Record<string, any>; // 音乐配置
  logo_info?: Record<string, any>; // 水印配置
  return_url?: boolean; // 是否返回视频URL
  return_video_base64?: boolean; // 是否返回视频base64
  advanced_params?: Record<string, any>; // 透传更多参数
  action?: string; // 自定义Action
  version?: string; // 自定义Version
  result_action?: string; // 查询任务Action
  result_version?: string; // 查询任务Version
  result_req_json?: string | Record<string, any>; // 查询任务附加req_json
  result_extra_body?: Record<string, any>; // 查询任务附加参数
}

/**
 * 视频生成任务提交响应
 */
export interface VideoTaskSubmitResponse {
  success: boolean;
  task_id?: string;
  error?: string;
  raw_response?: any;
}

/**
 * 视频生成结果查询响应
 */
export interface VideoTaskResultResponse {
  success: boolean;
  status?: string; // 任务状态：PENDING, RUNNING, SUCCEEDED, FAILED
  video_urls?: string[];
  video_base64_list?: string[];
  error?: string;
  raw_response?: any;
}

/**
 * 视频生成响应
 */
export interface GenerateVideoResponse {
  success: boolean;
  video_urls?: string[];
  video_base64_list?: string[];
  error?: string;
  raw_response?: any;
  task_id?: string;
  status?: string;
}

/**
 * 图生视频参数
 */
export interface GenerateI2VParams {
  /**
   * 模型标识符，默认为"jimeng_vgfm_i2v_l22"
   */
  req_key?: string;
  
  /**
   * 图片URL，必填
   */
  image_url?: string;
  
  /**
   * 图片URL数组，优先级高于image_url
   */
  image_urls?: string[];
  
  /**
   * 提示词，可选
   */
  prompt?: string;

  /**
   * 反向提示词，可选
   */
  negative_prompt?: string;

  /**
   * 输出视频数量，可选
   */
  video_num?: number;

  /**
   * 输出视频时长，单位秒
   */
  duration?: number;

  /**
   * 帧率设置
   */
  frame_rate?: number;

  /**
   * CFG Scale
   */
  cfg_scale?: number;

  /**
   * 随机种子
   */
  seed?: number;

  /**
   * 动作强度
   */
  motion_strength?: number;

  /**
   * 自定义音频配置
   */
  music?: Record<string, any>;

  /**
   * 水印配置
   */
  logo_info?: Record<string, any>;

  /**
   * 其他参数透传
   */
  advanced_params?: Record<string, any>;
  
  /**
   * 指定输出视频的长宽比，可选值："1:1", "4:3", "2:1", "3:2", "16:9"，默认 "16:9"
   */
  aspect_ratio?: string;

  /**
   * 区域，可选，默认为"cn-north-1"
   */
  region?: string;

  /**
   * 自定义Action
   */
  action?: string;

  /**
   * 自定义Version
   */
  version?: string;

  /**
   * 查询任务Action
   */
  result_action?: string;

  /**
   * 查询任务Version
   */
  result_version?: string;

  /**
   * 查询任务req_json
   */
  result_req_json?: string | Record<string, any>;

  /**
   * 查询任务附加参数
   */
  result_extra_body?: Record<string, any>;
}

/**
 * 即梦AI客户端
 * 使用火山引擎V4签名算法实现
 */
export class JimengClient {
  private accessKey: string;
  private secretKey: string;
  private endpoint: string;
  private host: string;
  private region: string;
  private service: string;
  private debug: boolean;
  private timeout: number;
  private retries: number;

  /**
   * 创建即梦AI客户端实例
   */
  constructor(config: JimengClientConfig = {}) {
    this.accessKey = config.accessKey || process.env.JIMENG_ACCESS_KEY || '';
    this.secretKey = config.secretKey || process.env.JIMENG_SECRET_KEY || '';
    this.endpoint = config.endpoint || 'https://visual.volcengineapi.com';
    this.host = config.host || 'visual.volcengineapi.com';
    this.region = config.region || 'cn-north-1';
    this.service = config.service || 'cv';
    this.debug = config.debug || false;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;

    // 验证必要的配置
    if (!this.accessKey || !this.secretKey) {
      throw new Error('缺少必要的配置: accessKey 和 secretKey');
    }

    if (this.debug) {
      debugLog('JimengClient 初始化完成:');
      debugLog('- 端点:', this.endpoint);
      debugLog('- 区域:', this.region);
      debugLog('- 服务:', this.service);
      debugLog('- AccessKey:', this.accessKey);
      debugLog('- SecretKey:', this.secretKey.substring(0, 3) + '...(已隐藏)');
    }
  }

  /**
   * 辅助函数：生成签名密钥
   */
  private getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
    const kDate = crypto.createHmac('sha256', key).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('request').digest();
    return kSigning;
  }

  /**
   * 格式化查询参数
   */
  private formatQuery(parameters: Record<string, string>): string {
    const sortedKeys = Object.keys(parameters).sort();
    return sortedKeys.map(key => `${key}=${parameters[key]}`).join('&');
  }

  /**
   * 判断字符串是否为HTTP(S) URL
   */
  private isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
  }

  /**
   * 解析文件的MIME类型
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.bmp':
        return 'image/bmp';
      case '.gif':
        return 'image/gif';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * 火山引擎V4签名算法
   */
  private signV4Request(
    reqQuery: string,
    reqBody: string | Buffer,
    options?: {
      region?: string;
      method?: string;
      contentType?: string;
      headers?: Record<string, string>;
    }
  ): { headers: Record<string, string>; requestUrl: string } {
    const t = new Date();
    const currentDate = t.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const datestamp = currentDate.substring(0, 8);
    const usedRegion = options?.region || this.region;

    const method = options?.method || 'POST';
    const canonicalUri = '/';
    const canonicalQuerystring = reqQuery;
    const signedHeaders = 'content-type;host;x-content-sha256;x-date';
    const bodyBuffer = typeof reqBody === 'string' ? Buffer.from(reqBody) : reqBody;
    const payloadHash = crypto.createHash('sha256').update(bodyBuffer).digest('hex');
    const contentType = options?.contentType || 'application/json';

    const canonicalHeaders = [
      `content-type:${contentType}`,
      `host:${this.host}`,
      `x-content-sha256:${payloadHash}`,
      `x-date:${currentDate}`
    ].join('\n') + '\n';

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQuerystring,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');
    
    if (this.debug) {
      debugLog('规范请求字符串:\n' + canonicalRequest);
    }
    
    const algorithm = 'HMAC-SHA256';
    const credentialScope = `${datestamp}/${usedRegion}/${this.service}/request`;
    const stringToSign = [
      algorithm,
      currentDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');
    
    if (this.debug) {
      debugLog('待签名字符串:\n' + stringToSign);
    }
    
    const signingKey = this.getSignatureKey(this.secretKey, datestamp, usedRegion, this.service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    
    if (this.debug) {
      debugLog('签名值:', signature);
    }
    
    const authorizationHeader = `${algorithm} Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    const headers: Record<string, string> = {
      'X-Date': currentDate,
      'Authorization': authorizationHeader,
      'X-Content-Sha256': payloadHash,
      'Content-Type': contentType,
      'Host': this.host
    };

    if (options?.headers) {
      Object.assign(headers, options.headers);
    }
    
    const requestUrl = `${this.endpoint}?${canonicalQuerystring}`;
    
    return { headers, requestUrl };
  }

  /**
   * 提交图像生成任务
   */
  public async submitImageTask(params: GenerateImageParams): Promise<ImageTaskSubmitResponse> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.retries) {
      try {
        if (!params.prompt) {
          throw new Error('缺少必要的参数: prompt');
        }

        const queryParams = {
          'Action': 'CVSync2AsyncSubmitTask',
          'Version': '2022-08-31'
        };
        const formattedQuery = this.formatQuery(queryParams);

        const bodyParams: Record<string, any> = {
          req_key: params.req_key || 'jimeng_t2i_v40',
          prompt: params.prompt
        };

        const allImageSources: string[] = [];
        if (params.image_urls && params.image_urls.length > 0) {
          allImageSources.push(...params.image_urls);
        }
        if (params.image_path) {
          allImageSources.push(params.image_path);
        }
        if (params.image_paths && params.image_paths.length > 0) {
          allImageSources.push(...params.image_paths);
        }

        if (allImageSources.length > 0) {
          const remoteUrls: string[] = [];
          const localPaths: string[] = [];

          for (const source of allImageSources) {
            if (this.isHttpUrl(source)) {
              remoteUrls.push(source);
            } else {
              const resolvedPath = path.isAbsolute(source) ? source : path.resolve(process.cwd(), source);
              localPaths.push(resolvedPath);
            }
          }

          if (localPaths.length > 0) {
            if (params.auto_upload === false) {
              throw new Error(`检测到本地图片路径，但 auto_upload 被禁用: ${localPaths.join(', ')}`);
            }

            const uploadResult = await this.uploadLocalImages({
              paths: localPaths,
              region: params.region
            });

            if (!uploadResult.success || !uploadResult.image_urls || uploadResult.image_urls.length === 0) {
              throw new Error(uploadResult.error || '本地图片上传失败');
            }

            remoteUrls.push(...uploadResult.image_urls);
          }

          if (remoteUrls.length > 0) {
            bodyParams.image_urls = remoteUrls;
          }
        }
        if (params.size !== undefined) {
          bodyParams.size = params.size;
        }
        if (params.width !== undefined) {
          bodyParams.width = params.width;
        }
        if (params.height !== undefined) {
          bodyParams.height = params.height;
        }
        if (params.scale !== undefined) {
          bodyParams.scale = params.scale;
        }
        if (params.force_single !== undefined) {
          bodyParams.force_single = params.force_single;
        }
        if (params.min_ratio !== undefined) {
          bodyParams.min_ratio = params.min_ratio;
        }
        if (params.max_ratio !== undefined) {
          bodyParams.max_ratio = params.max_ratio;
        }
        if (params.seed !== undefined) {
          bodyParams.seed = params.seed;
        }
        if (params.negative_prompt !== undefined) {
          bodyParams.negative_prompt = params.negative_prompt;
        }

        const formattedBody = JSON.stringify(bodyParams);

        if (this.debug) {
          debugLog('图像任务提交请求体:', formattedBody);
        }

        const { headers, requestUrl } = this.signV4Request(
          formattedQuery,
          formattedBody,
          {
            region: params.region
          }
        );

        if (this.debug) {
          debugLog('图像任务提交请求URL:', requestUrl);
          debugLog('图像任务提交请求头:', JSON.stringify(headers, null, 2));
        }

        const response = await axios.post(requestUrl, bodyParams, {
          headers: headers,
          timeout: this.timeout,
          validateStatus: null
        });

        if (this.debug) {
          debugLog('图像任务提交响应状态码:', response.status);
          debugLog('图像任务提交响应数据:', JSON.stringify(response.data, null, 2));
        }

        if (response.status !== 200) {
          if (response.status === 429) {
            throw new Error(`API并发限制错误: 请求过于频繁，请稍后再试。详细信息: ${JSON.stringify(response.data)}`);
          }
          throw new Error(`HTTP错误! 状态码: ${response.status}，详细信息: ${JSON.stringify(response.data)}`);
        }

        const data = response.data;
        if (data.code !== 10000) {
          throw new Error(`API错误: ${data.message || '未知错误'} (错误码: ${data.code})`);
        }

        const taskId = data.data?.task_id;
        if (!taskId) {
          throw new Error('API未返回任务ID');
        }

        return {
          success: true,
          task_id: taskId,
          raw_response: data
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.debug) {
          debugLog(`提交图像任务尝试 #${attempt + 1} 失败:`, lastError.message);
        }

        attempt++;

        if (attempt > this.retries) {
          if (this.debug) {
            debugLog(`已达到最大重试次数 (${this.retries})，放弃提交图像任务`);
          }

          return {
            success: false,
            error: lastError.message
          };
        }

        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);

        if (this.debug) {
          debugLog(`等待 ${waitTime}ms 后重试提交图像任务...`);
        }

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    return {
      success: false,
      error: '未知错误'
    };
  }

  /**
   * 查询图像生成任务结果
   */
  public async getImageTaskResult(
    taskId: string,
    options: {
      req_key?: string;
      region?: string;
      return_url?: boolean;
      logo_info?: ImageLogoInfo;
      req_json?: Record<string, any> | string;
    } = {}
  ): Promise<ImageTaskResultResponse> {
    const queryParams = {
      'Action': 'CVSync2AsyncGetResult',
      'Version': '2022-08-31'
    };
    const formattedQuery = this.formatQuery(queryParams);

    const reqKey = options.req_key || 'jimeng_t2i_v40';
    let reqJsonValue: string | undefined;

    if (options.req_json !== undefined) {
      reqJsonValue = typeof options.req_json === 'string'
        ? options.req_json
        : JSON.stringify(options.req_json);
    } else {
      const returnUrl = options.return_url !== undefined ? options.return_url : true;
      const reqJson: Record<string, any> = { return_url: returnUrl };

      if (options.logo_info) {
        reqJson.logo_info = options.logo_info;
      }

      reqJsonValue = JSON.stringify(reqJson);
    }

    const bodyParams: Record<string, any> = {
      req_key: reqKey,
      task_id: taskId
    };

    if (reqJsonValue) {
      bodyParams.req_json = reqJsonValue;
    }

    const formattedBody = JSON.stringify(bodyParams);

    if (this.debug) {
      debugLog('查询图像任务结果请求体:', formattedBody);
    }

    const { headers, requestUrl } = this.signV4Request(
      formattedQuery,
      formattedBody,
      {
        region: options.region
      }
    );

    if (this.debug) {
      debugLog('查询图像任务结果请求URL:', requestUrl);
      debugLog('查询图像任务结果请求头:', JSON.stringify(headers, null, 2));
    }

    const response = await axios({
      url: requestUrl,
      method: 'POST',
      headers: headers,
      data: formattedBody,
      timeout: this.timeout,
      validateStatus: null
    });

    if (this.debug) {
      debugLog('查询图像任务结果响应状态码:', response.status);
      debugLog('查询图像任务结果响应数据:', JSON.stringify(response.data, null, 2));
    }

    if (response.status !== 200) {
      return {
        success: false,
        error: `HTTP错误! 状态码: ${response.status}`,
        raw_response: response.data
      };
    }

    const data = response.data;

    if (data.code !== 10000) {
      return {
        success: false,
        status: data.data?.status,
        status_raw: data.data?.status,
        error: `API错误: ${data.message || '未知错误'} (错误码: ${data.code})`,
        raw_response: data
      };
    }

    const taskData = data.data || {};
    const statusRaw: string | undefined = taskData.status;

    const normalizedStatus = (() => {
      switch (statusRaw) {
        case 'in_queue':
          return 'IN_QUEUE';
        case 'generating':
        case 'processing':
          return 'GENERATING';
        case 'done':
          return 'DONE';
        case 'fail':
          return 'FAILED';
        case 'not_found':
          return 'NOT_FOUND';
        case 'expired':
          return 'EXPIRED';
        default:
          return statusRaw ? statusRaw.toUpperCase() : undefined;
      }
    })();

    return {
      success: true,
      status: normalizedStatus,
      status_raw: statusRaw,
      image_urls: taskData.image_urls || undefined,
      binary_data_base64: taskData.binary_data_base64 || undefined,
      raw_response: data
    };
  }

  /**
   * 上传本地图片以获取可访问的URL
   */
  public async uploadLocalImages(params: UploadImageParams): Promise<UploadImageResponse> {
    if (!params.paths || params.paths.length === 0) {
      return { success: false, error: '至少提供一个本地图片路径' };
    }

    try {
      const files = await Promise.all(params.paths.map(async (inputPath) => {
        const absolutePath = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);

        const stats = await fsPromises.stat(absolutePath);
        if (!stats.isFile()) {
          throw new Error(`路径不是文件: ${absolutePath}`);
        }

        const buffer = await fsPromises.readFile(absolutePath);
        const filename = path.basename(absolutePath);
        const contentType = this.getMimeType(absolutePath);

        return { filename, buffer, contentType };
      }));

      const boundary = `----JimengFormBoundary${crypto.randomBytes(8).toString('hex')}`;
      const CRLF = '\r\n';
      const fieldName = 'image_file';

      const parts: Buffer[] = [];
      for (const file of files) {
        parts.push(Buffer.from(`--${boundary}${CRLF}`));
        parts.push(Buffer.from(`Content-Disposition: form-data; name="${fieldName}"; filename="${file.filename}"${CRLF}`));
        parts.push(Buffer.from(`Content-Type: ${file.contentType}${CRLF}${CRLF}`));
        parts.push(file.buffer);
        parts.push(Buffer.from(CRLF));
      }
      parts.push(Buffer.from(`--${boundary}--${CRLF}`));

      const requestBody = Buffer.concat(parts);

      const queryParams = {
        Action: params.action || 'CVUploadImages',
        Version: params.version || '2022-08-31'
      };
      const formattedQuery = this.formatQuery(queryParams);

      const contentTypeHeader = `multipart/form-data; boundary=${boundary}`;
      const { headers, requestUrl } = this.signV4Request(
        formattedQuery,
        requestBody,
        {
          region: params.region,
          contentType: contentTypeHeader
        }
      );

      headers['Content-Length'] = requestBody.length.toString();

      if (this.debug) {
        debugLog('上传图片请求URL:', requestUrl);
        debugLog('上传图片请求头:', JSON.stringify(headers, null, 2));
      }

      const response = await axios.post(requestUrl, requestBody, {
        headers,
        timeout: this.timeout,
        validateStatus: null
      });

      if (this.debug) {
        debugLog('上传图片响应状态码:', response.status);
        debugLog('上传图片响应数据:', JSON.stringify(response.data, null, 2));
      }

      if (response.status !== 200) {
        return {
          success: false,
          error: `HTTP错误! 状态码: ${response.status}`,
          raw_response: response.data
        };
      }

      const data = response.data;
      const imageUrls = data?.data?.image_urls || data?.result?.image_urls || data?.image_urls;

      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        return {
          success: true,
          image_urls: imageUrls,
          raw_response: data
        };
      }

      return {
        success: false,
        error: '上传成功但未返回图片URL',
        raw_response: data
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message
      };
    }
  }

  /**
   * 生成图像
   */
  public async generateImage(params: GenerateImageParams): Promise<GenerateImageResponse> {
    const submitResult = await this.submitImageTask(params);

    if (!submitResult.success || !submitResult.task_id) {
      return {
        success: false,
        error: submitResult.error || '提交图像生成任务失败',
        raw_response: submitResult.raw_response
      };
    }

    const taskId = submitResult.task_id;
    const pollingInterval = params.pollingIntervalMs ?? 5000;
    const maxAttempts = params.maxPollAttempts ?? 60;

    if (this.debug) {
      debugLog(`图像任务提交成功，任务ID: ${taskId}`);
      debugLog(`开始轮询图像任务结果，最多尝试 ${maxAttempts} 次，每次间隔 ${pollingInterval}ms`);
    }

    let lastResult: ImageTaskResultResponse | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (this.debug) {
        debugLog(`查询图像任务结果 (${attempt + 1}/${maxAttempts})...`);
      }

      lastResult = await this.getImageTaskResult(taskId, {
        req_key: params.req_key,
        region: params.region,
        return_url: params.return_url,
        logo_info: params.logo_info,
        req_json: params.req_json
      });

      if (!lastResult.success) {
        if (this.debug) {
          debugLog('查询图像任务结果失败:', lastResult.error || '未知错误');
        }

        return {
          success: false,
          error: lastResult.error || '查询图像生成任务失败',
          raw_response: lastResult.raw_response,
          task_id: taskId,
          status: lastResult.status
        };
      }

      if (lastResult.status === 'DONE' || lastResult.status === 'SUCCEEDED') {
        if (lastResult.image_urls && lastResult.image_urls.length > 0) {
          return {
            success: true,
            image_urls: lastResult.image_urls,
            binary_data_base64: lastResult.binary_data_base64,
            raw_response: lastResult.raw_response,
            task_id: taskId,
            status: lastResult.status
          };
        }

        if (lastResult.binary_data_base64 && lastResult.binary_data_base64.length > 0) {
          return {
            success: true,
            binary_data_base64: lastResult.binary_data_base64,
            raw_response: lastResult.raw_response,
            task_id: taskId,
            status: lastResult.status
          };
        }

        return {
          success: false,
          error: '任务完成但未返回图像数据',
          raw_response: lastResult.raw_response,
          task_id: taskId,
          status: lastResult.status
        };
      }

      if (lastResult.status === 'FAILED' || lastResult.status === 'NOT_FOUND' || lastResult.status === 'EXPIRED') {
        return {
          success: false,
          error: lastResult.error || `图像生成任务失败，状态: ${lastResult.status}`,
          raw_response: lastResult.raw_response,
          task_id: taskId,
          status: lastResult.status
        };
      }

      if (attempt < maxAttempts - 1) {
        if (this.debug) {
          debugLog(`任务状态: ${lastResult.status || '未知'}，等待 ${pollingInterval}ms 后继续查询...`);
        }
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
      }
    }

    return {
      success: false,
      error: '轮询任务结果超时，请使用任务ID手动查询结果',
      task_id: taskId,
      status: lastResult?.status,
      raw_response: lastResult?.raw_response
    };
  }

  /**
   * 生成视频 - 文生视频 (异步方式: 提交任务)
   */
  public async submitVideoTask(params: GenerateVideoParams): Promise<VideoTaskSubmitResponse> {
    let lastError: Error | null = null;
    const retries = 1;  // 只重试一次
    let retryCount = 0;
    
    while (retryCount <= retries) {
      try {
        // 验证必要的参数
        if (!params.prompt) {
          throw new Error('缺少必要的参数: prompt');
        }
        
        // 查询参数 - 使用异步提交任务API
        const action = params.action || 'CVSync2AsyncSubmitTask';
        const version = params.version || '2022-08-31';

        const queryParams = {
          'Action': action,
          'Version': version
        };
        const formattedQuery = this.formatQuery(queryParams);

        // 请求体参数
        const bodyParams: Record<string, any> = {
          req_key: params.req_key || "jimeng_vgfm_t2v_l22",
          prompt: params.prompt
        };

        if (params.negative_prompt !== undefined) {
          bodyParams.negative_prompt = params.negative_prompt;
        }
        if (params.duration !== undefined) {
          bodyParams.duration = params.duration;
        }
        if (params.video_num !== undefined) {
          bodyParams.video_num = params.video_num;
        }
        if (params.frame_rate !== undefined) {
          bodyParams.frame_rate = params.frame_rate;
        }
        if (params.aspect_ratio !== undefined) {
          bodyParams.aspect_ratio = params.aspect_ratio;
        }
        if (params.width !== undefined) {
          bodyParams.width = params.width;
        }
        if (params.height !== undefined) {
          bodyParams.height = params.height;
        }
        if (params.resolution !== undefined) {
          bodyParams.resolution = params.resolution;
        }
        if (params.cfg_scale !== undefined) {
          bodyParams.cfg_scale = params.cfg_scale;
        }
        if (params.seed !== undefined) {
          bodyParams.seed = params.seed;
        }
        if (params.motion_strength !== undefined) {
          bodyParams.motion_strength = params.motion_strength;
        }
        if (params.music !== undefined) {
          bodyParams.music = params.music;
        }
        if (params.logo_info !== undefined) {
          bodyParams.logo_info = params.logo_info;
        }
        if (params.return_url !== undefined) {
          bodyParams.return_url = params.return_url;
        }
        if (params.return_video_base64 !== undefined) {
          bodyParams.return_video_base64 = params.return_video_base64;
        }
        if (params.advanced_params) {
          Object.assign(bodyParams, params.advanced_params);
        }

        const formattedBody = JSON.stringify(bodyParams);
        
        // 总是开启调试信息以便排查问题
        debugLog('提交任务请求体:', formattedBody);
        
        // 生成签名和请求头
        const { headers, requestUrl } = this.signV4Request(
          formattedQuery,
          formattedBody,
          {
            region: params.region
          }
        );
        
        // 打印请求信息以便调试
        debugLog('提交任务请求URL:', requestUrl);
        debugLog('提交任务请求头:', JSON.stringify(headers, null, 2));
        
        // 发送请求
        const response = await axios.post(requestUrl, bodyParams, {
          headers: headers,
          timeout: this.timeout,
          validateStatus: null // 允许任何状态码
        });
        
        // 打印响应信息以便调试
        debugLog('提交任务响应状态码:', response.status);
        debugLog('提交任务响应数据:', JSON.stringify(response.data, null, 2));
        
        // 处理响应
        if (response.status !== 200) {
          // 特殊处理429错误
          if (response.status === 429) {
            throw new Error(`API并发限制错误: 请求过于频繁，请稍后再试。详细信息: ${JSON.stringify(response.data)}`);
          }
          throw new Error(`HTTP错误! 状态码: ${response.status}，详细信息: ${JSON.stringify(response.data)}`);
        }
        
        // 检查API错误
        if (response.data.ResponseMetadata && response.data.ResponseMetadata.Error) {
          const error = response.data.ResponseMetadata.Error;
          throw new Error(`API错误: ${error.Message || '未知错误'}, 错误码: ${error.Code || '无代码'}`);
        }
        
        // 返回结果 - 任务ID
        if (response.data.data && response.data.data.task_id) {
          return {
            success: true,
            task_id: response.data.data.task_id,
            raw_response: response.data
          };
        } else {
          return {
            success: false,
            error: '提交任务失败或响应格式不正确',
            raw_response: response.data
          };
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (this.debug) {
          debugLog(`尝试提交任务 #${retryCount + 1} 失败:`, lastError.message);
        }
        
        retryCount++;
        
        // 如果已经达到最大重试次数，返回错误
        if (retryCount > retries) {
          if (this.debug) {
            debugLog(`已达到最大重试次数 (${retries})，放弃重试`);
          }
          
          // 如果是429错误，给出更友好的提示
          if (lastError.message.includes('429') || lastError.message.includes('并发限制')) {
            return {
              success: false,
              error: '请求频率受限，请等待几分钟后再尝试提交视频生成任务。火山引擎对视频生成API有严格的并发限制。'
            };
          }
          
          return {
            success: false,
            error: lastError.message
          };
        }
        
        // 视频API调用等待时间设为固定的60秒（1分钟），符合QPS=1的限制
        const waitTime = 60000; // 60秒 = 1分钟
        
        debugLog(`请求受限，等待 ${waitTime/1000} 秒后重试...`);
        debugLog(`将在 ${new Date(Date.now() + waitTime).toLocaleTimeString()} 重试`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // 不应该运行到这里
    return {
      success: false,
      error: '未知错误'
    };
  }

  /**
   * 查询视频生成任务结果
   */
  public async getVideoTaskResult(
    taskId: string,
    reqKey: string = "jimeng_vgfm_t2v_l22",
    options: {
      region?: string;
      action?: string;
      version?: string;
      req_json?: string | Record<string, any>;
      extra_body?: Record<string, any>;
    } = {}
  ): Promise<VideoTaskResultResponse> {
    let lastError: Error | null = null;
    const retries = 1;  // 只重试一次
    let retryCount = 0;
    
    while (retryCount <= retries) {
      try {
        // 查询参数 - 使用查询结果API
        const action = options.action || 'CVSync2AsyncGetResult';
        const version = options.version || '2022-08-31';

        const queryParams = {
          'Action': action,
          'Version': version
        };
        const formattedQuery = this.formatQuery(queryParams);

        // 请求体参数
        const bodyParams: Record<string, any> = {
          req_key: reqKey,
          task_id: taskId
        };

        if (options.req_json !== undefined) {
          bodyParams.req_json = typeof options.req_json === 'string'
            ? options.req_json
            : JSON.stringify(options.req_json);
        }

        if (options.extra_body) {
          Object.assign(bodyParams, options.extra_body);
        }
        
        const formattedBody = JSON.stringify(bodyParams);
        
        // 总是开启调试信息以便排查问题
        debugLog('查询结果请求体:', formattedBody);
        
        // 生成签名和请求头
        const { headers, requestUrl } = this.signV4Request(
          formattedQuery,
          formattedBody,
          {
            region: options.region
          }
        );
        
        // 开启调试信息
        debugLog('查询结果请求URL:', requestUrl);
        debugLog('查询结果请求头:', headers);
        
        // 发送请求
        const response = await axios({
          url: requestUrl,
          method: 'POST',
          headers: headers,
          data: formattedBody,
        });
        
        debugLog('查询结果响应状态码:', response.status);
        debugLog('查询结果响应数据:', JSON.stringify(response.data, null, 2));
        
        // 处理响应
        if (response.status === 200) {
          const data = response.data;
          
          // 处理服务器内部错误和其他业务错误
          if (data.code !== 10000) {
            // 处理特定错误代码
            if (data.code === 50411) {
              // 内容安全检查未通过
              return {
                success: false,
                status: 'FAILED',
                error: `内容安全检查未通过: ${data.message}`,
                raw_response: data
              };
            }
            
            // 其他业务错误
            throw new Error(`服务器返回业务错误: ${data.message} (错误码: ${data.code})`);
          }
          
          // 处理状态
          const taskData = data.data;
          const taskStatus = taskData.status;
          
          let normalizedStatus = '';
          
          // 标准化状态值
          switch(taskStatus) {
            case 'in_queue':
              normalizedStatus = 'PENDING';
              break;
            case 'processing':
              normalizedStatus = 'RUNNING';
              break;
            case 'done':
              normalizedStatus = 'SUCCEEDED';
              break;
            case 'fail':
              normalizedStatus = 'FAILED';
              break;
            default:
              normalizedStatus = taskStatus.toUpperCase();
          }
          
          // 解析视频URL和Base64数据
          let videoUrls: string[] = [];
          let videoBase64List: string[] = [];

          // 1. 从resp_data中解析视频URLs（需要先将字符串解析为JSON对象）
          if (taskData.resp_data && typeof taskData.resp_data === 'string') {
            try {
              const respData = JSON.parse(taskData.resp_data);
              if (respData.urls && Array.isArray(respData.urls)) {
                videoUrls = respData.urls;
              }
              if (respData.video_urls && Array.isArray(respData.video_urls)) {
                videoUrls = videoUrls.concat(respData.video_urls);
              }
              if (respData.binary_data_base64 && Array.isArray(respData.binary_data_base64)) {
                videoBase64List = videoBase64List.concat(respData.binary_data_base64);
              }
              if (respData.video_base64_list && Array.isArray(respData.video_base64_list)) {
                videoBase64List = videoBase64List.concat(respData.video_base64_list);
              }
              if (respData.base64_list && Array.isArray(respData.base64_list)) {
                videoBase64List = videoBase64List.concat(respData.base64_list);
              }
            } catch (e) {
              debugLog('解析resp_data时出错:', e);
            }
          }

          // 2. 如果存在video_url字段，添加到videoUrls
          if (taskData.video_url && typeof taskData.video_url === 'string') {
            videoUrls.push(taskData.video_url);
          }

          if (Array.isArray(taskData.video_urls)) {
            videoUrls = videoUrls.concat(taskData.video_urls);
          }

          if (Array.isArray(taskData.video_base64_list)) {
            videoBase64List = videoBase64List.concat(taskData.video_base64_list);
          }

          if (Array.isArray(taskData.binary_data_base64)) {
            videoBase64List = videoBase64List.concat(taskData.binary_data_base64);
          }

          const uniqueVideoUrls = videoUrls.filter(Boolean).length > 0
            ? Array.from(new Set(videoUrls.filter(Boolean)))
            : [];

          const uniqueVideoBase64 = videoBase64List.filter(Boolean).length > 0
            ? Array.from(new Set(videoBase64List.filter(Boolean)))
            : [];

          const responsePayload: VideoTaskResultResponse = {
            success: true,
            status: normalizedStatus,
            video_urls: uniqueVideoUrls,
            raw_response: data
          };

          if (uniqueVideoBase64.length > 0) {
            responsePayload.video_base64_list = uniqueVideoBase64;
          }

          // 返回任务状态和视频数据
          return responsePayload;
        } else {
          throw new Error(`HTTP错误! 状态码: ${response.status}，详细信息: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (this.debug) {
          debugLog(`尝试查询结果 #${retryCount + 1} 失败:`, lastError.message);
        }
        
        retryCount++;
        
        // 如果已经达到最大重试次数，返回错误
        if (retryCount > retries) {
          if (this.debug) {
            debugLog(`已达到最大重试次数 (${retries})，放弃重试`);
          }
          
          return {
            success: false,
            error: lastError.message
          };
        }
        
        // 查询结果API调用使用较短的重试时间
        const waitTime = 5000; // 5秒
        
        debugLog(`查询失败，等待 ${waitTime/1000} 秒后重试...`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // 不应该运行到这里
    return {
      success: false,
      error: '未知错误'
    };
  }

  /**
   * 生成视频 - 文生视频 (保留原方法作为兼容)
   * @deprecated 使用异步方式生成视频，请使用 submitVideoTask 和 getVideoTaskResult 代替
   */
  public async generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResponse> {
    debugLog('警告: generateVideo 方法已过时，请使用 submitVideoTask 和 getVideoTaskResult 代替');
    
    // 提交任务
    const taskResult = await this.submitVideoTask(params);
    if (!taskResult.success || !taskResult.task_id) {
      return {
        success: false,
        error: taskResult.error || '提交任务失败'
      };
    }
    
    debugLog(`任务提交成功，任务ID: ${taskResult.task_id}`);
    debugLog('开始轮询任务结果...');
    
    // 轮询查询任务结果
    const maxAttempts = 30; // 最多等待30次
    const pollingInterval = 5000; // 5秒轮询一次
    
    for (let i = 0; i < maxAttempts; i++) {
      debugLog(`轮询任务结果 (${i+1}/${maxAttempts})...`);
      
      // 查询任务结果
      const result = await this.getVideoTaskResult(
        taskResult.task_id,
        params.req_key || 'jimeng_vgfm_t2v_l22',
        {
          region: params.region,
          action: params.result_action,
          version: params.result_version,
          req_json: params.result_req_json,
          extra_body: params.result_extra_body
        }
      );

      if (result.success) {
        // 根据任务状态处理
        if ((result.status === 'SUCCEEDED' || result.status === 'done') && result.video_urls && result.video_urls.length > 0) {
          debugLog('视频生成成功!');
          return {
            success: true,
            video_urls: result.video_urls,
            video_base64_list: result.video_base64_list,
            raw_response: result.raw_response,
            task_id: taskResult.task_id,
            status: result.status
          };
        } else if (result.status === 'FAILED') {
          return {
            success: false,
            error: '视频生成任务失败',
            raw_response: result.raw_response,
            task_id: taskResult.task_id,
            status: result.status
          };
        } else if (result.status === 'PENDING' || result.status === 'RUNNING') {
          debugLog(`任务仍在进行中，状态: ${result.status}，等待 ${pollingInterval/1000} 秒后重试...`);
          // 任务仍在进行中，继续等待
          await new Promise(resolve => setTimeout(resolve, pollingInterval));
          continue;
        }
      }
      
      // 查询失败或状态异常，等待后重试
      debugLog('查询任务结果失败或状态异常，等待后重试...');
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }
    
    // 超过最大尝试次数
    return {
      success: false,
      error: '轮询任务结果超时，请使用任务ID手动查询结果',
      task_id: taskResult.task_id
    };
  }

  /**
   * 提交图生视频任务 - 图片生成视频
   */
  public async submitI2VTask(params: GenerateI2VParams): Promise<VideoTaskSubmitResponse> {
    let lastError: Error | null = null;
    const retries = 1;  // 只重试一次
    let retryCount = 0;
    
    while (retryCount <= retries) {
      try {
        // 准备图片URL数组
        let imageUrls: string[] = [];
        if (params.image_urls && params.image_urls.length > 0) {
          // 优先使用image_urls数组
          imageUrls = params.image_urls;
        } else if (params.image_url) {
          // 如果没有提供image_urls但提供了image_url，则将其转换为数组
          imageUrls = [params.image_url];
        } else {
          throw new Error('缺少必要的参数: image_url 或 image_urls');
        }
        
        // 查询参数 - 使用异步提交任务API
        const action = params.action || 'CVSync2AsyncSubmitTask';
        const version = params.version || '2022-08-31';

        const queryParams = {
          'Action': action,
          'Version': version
        };
        const formattedQuery = this.formatQuery(queryParams);

        // 请求体参数 - 默认使用图生视频模型
        const bodyParams: Record<string, any> = {
          req_key: params.req_key || "jimeng_vgfm_i2v_l22",
          image_urls: imageUrls,
          // 必须指定aspect_ratio参数，不能使用keep_ratio
          aspect_ratio: params.aspect_ratio || "16:9",
          // 如果有提示词则添加
          ...(params.prompt ? { prompt: params.prompt } : {})
        };

        if (params.negative_prompt !== undefined) {
          bodyParams.negative_prompt = params.negative_prompt;
        }
        if (params.video_num !== undefined) {
          bodyParams.video_num = params.video_num;
        }
        if (params.duration !== undefined) {
          bodyParams.duration = params.duration;
        }
        if (params.frame_rate !== undefined) {
          bodyParams.frame_rate = params.frame_rate;
        }
        if (params.cfg_scale !== undefined) {
          bodyParams.cfg_scale = params.cfg_scale;
        }
        if (params.seed !== undefined) {
          bodyParams.seed = params.seed;
        }
        if (params.motion_strength !== undefined) {
          bodyParams.motion_strength = params.motion_strength;
        }
        if (params.music !== undefined) {
          bodyParams.music = params.music;
        }
        if (params.logo_info !== undefined) {
          bodyParams.logo_info = params.logo_info;
        }
        if (params.advanced_params) {
          Object.assign(bodyParams, params.advanced_params);
        }

        const formattedBody = JSON.stringify(bodyParams);
        
        // 调试信息
        debugLog('提交任务请求体:', formattedBody);
        
        // 生成签名和请求头
        const { headers, requestUrl } = this.signV4Request(
          formattedQuery,
          formattedBody,
          {
            region: params.region
          }
        );
        
        // 调试信息
        debugLog('提交任务请求URL:', requestUrl);
        debugLog('提交任务请求头:', headers);
        
        // 发送请求
        const response = await axios({
          url: requestUrl,
          method: 'POST',
          headers: headers,
          data: formattedBody
        });
        
        // 调试信息
        debugLog('提交任务响应状态码:', response.status);
        debugLog('提交任务响应数据:', JSON.stringify(response.data, null, 2));
        
        // 处理响应
        if (response.status === 200) {
          if (response.data.status === 10000 || response.data.code === 10000) {
            // 从响应中提取任务ID
            const taskId = response.data.data?.task_id;
            if (!taskId) {
              throw new Error('服务器未返回任务ID');
            }
            
            return {
              success: true,
              task_id: taskId,
              raw_response: response.data
            };
          } else {
            throw new Error(`API错误: ${response.data.message || '未知错误'}, 错误码: ${response.data.code || response.data.status || '无'}`);
          }
        } else {
          throw new Error(`HTTP错误! 状态码: ${response.status}，详细信息: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // 提取错误信息，检查是否是由于图片格式问题
        const errorMsg = lastError.message || '';
        if (errorMsg.includes('Image Decode Error') || 
            errorMsg.includes('image format unsupported') ||
            errorMsg.includes('image url')) {
          // 图片格式错误，提供更友好的错误信息
          return {
            success: false,
            error: `图片格式不支持或无法访问。请确保提供的是可公开访问的JPEG或PNG格式图片URL。详细错误: ${errorMsg}`
          };
        }
        
        debugLog(`提交图生视频任务尝试 #${retryCount + 1} 失败: ${lastError.message}`);
        
        if (retryCount < retries) {
          // 计算重试等待时间 - 固定为60秒以避免API限流
          const waitSeconds = 60;
          const nextRetryTime = new Date(Date.now() + waitSeconds * 1000);
          const timeString = nextRetryTime.toLocaleTimeString();
          debugLog(`提交任务失败，将在 ${timeString} 重试...`);
          
          // 等待指定时间
          await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
          retryCount++;
        } else {
          debugLog(`已达到最大重试次数 (${retries})，放弃重试`);
          break;
        }
      }
    }
    
    return {
      success: false,
      error: lastError ? lastError.message : '提交任务失败，已达到最大重试次数'
    };
  }
  
  /**
   * 生成视频 - 图片生成视频 (一步到位方式)
   */
  public async generateI2VVideo(params: GenerateI2VParams): Promise<GenerateVideoResponse> {
    debugLog('生成图生视频中...(内部会自动提交任务并轮询结果)');
    
    // 提交任务
    const taskResult = await this.submitI2VTask(params);
    if (!taskResult.success || !taskResult.task_id) {
      return {
        success: false,
        error: taskResult.error || '提交任务失败'
      };
    }
    
    debugLog(`任务提交成功，任务ID: ${taskResult.task_id}`);
    debugLog('开始轮询任务结果...');
    
    // 轮询查询任务结果 - 复用文生视频的查询结果方法
    const maxAttempts = 30; // 最多等待30次
    const pollingInterval = 5000; // 5秒轮询一次
    
    for (let i = 0; i < maxAttempts; i++) {
      debugLog(`轮询任务结果 (${i+1}/${maxAttempts})...`);
      
      // 查询任务结果
      const result = await this.getVideoTaskResult(
        taskResult.task_id,
        params.req_key || "jimeng_vgfm_i2v_l22",
        {
          region: params.region,
          action: params.result_action,
          version: params.result_version,
          req_json: params.result_req_json,
          extra_body: params.result_extra_body
        }
      );
      
      if (result.success) {
        // 根据任务状态处理
        if ((result.status === 'SUCCEEDED' || result.status === 'done') && result.video_urls && result.video_urls.length > 0) {
          debugLog('视频生成成功!');
          return {
            success: true,
            video_urls: result.video_urls,
            video_base64_list: result.video_base64_list,
            raw_response: result.raw_response,
            task_id: taskResult.task_id,
            status: result.status
          };
        } else if (result.status === 'FAILED') {
          return {
            success: false,
            error: '视频生成任务失败',
            raw_response: result.raw_response,
            task_id: taskResult.task_id,
            status: result.status
          };
        } else if (result.status === 'PENDING' || result.status === 'RUNNING' || result.status === 'in_queue') {
          debugLog(`任务仍在进行中，状态: ${result.status}，等待 ${pollingInterval/1000} 秒后重试...`);
          // 任务仍在进行中，继续等待
          await new Promise(resolve => setTimeout(resolve, pollingInterval));
          continue;
        }
      }
      
      // 查询失败或状态异常，等待后重试
      debugLog('查询任务结果失败或状态异常，等待后重试...');
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }
    
    // 超过最大尝试次数
    return {
      success: false,
      error: '轮询任务结果超时，请使用任务ID手动查询结果',
      task_id: taskResult.task_id
    };
  }
}

// 验证键辅助函数
export function verifyKeys(keys: string[], required: string[]): string[] {
  return required.filter(key => !keys.includes(key));
}
