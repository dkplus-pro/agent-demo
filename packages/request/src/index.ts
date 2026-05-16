type RequestData = UniApp.RequestOptions['data'];

export interface RequestOptions {
  method?: UniApp.RequestOptions['method'];
  data?: RequestData;
  header?: Record<string, string>;
  baseURL?: string;
}

export interface RequestConfig {
  baseURL?: string;
  getToken?: () => string | undefined;
}

let config: RequestConfig = {};

export function setupRequest(nextConfig: RequestConfig) {
  config = {
    ...config,
    ...nextConfig,
  };
}

export function request<TResponse = unknown>(
  url: string,
  options: RequestOptions = {},
) {
  const baseURL = options.baseURL ?? config.baseURL ?? '';
  const token = config.getToken?.();

  return new Promise<TResponse>((resolve, reject) => {
    uni.request({
      url: `${baseURL}${url}`,
      method: options.method ?? 'GET',
      data: options.data,
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success(response) {
        const statusCode = response.statusCode ?? 0;

        if (statusCode >= 200 && statusCode < 300) {
          resolve(response.data as TResponse);
          return;
        }

        reject(response);
      },
      fail: reject,
    });
  });
}
