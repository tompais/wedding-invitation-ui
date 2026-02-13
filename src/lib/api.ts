/**
 * API Client - Wrapper ligero sobre fetch nativo
 *
 * Centraliza la configuración de requests HTTP.
 * Aprovecha el fetch extendido de Next.js (caching, revalidation).
 *
 * Principios: DRY, Single Responsibility
 */

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Cliente HTTP genérico
 */
async function request<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<ApiResponse<TResponse>> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: data?.error || `Error ${response.status}`,
        status: response.status,
      };
    }

    return {
      data: data as TResponse,
      error: null,
      status: response.status,
    };
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    return {
      data: null,
      error: "Error de conexión",
      status: 0,
    };
  }
}

/**
 * Métodos HTTP tipados
 */
export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "GET", headers }),

  post: <T, TBody = unknown>(
    endpoint: string,
    body: TBody,
    headers?: Record<string, string>
  ) => request<T, TBody>(endpoint, { method: "POST", body, headers }),

  put: <T, TBody = unknown>(
    endpoint: string,
    body: TBody,
    headers?: Record<string, string>
  ) => request<T, TBody>(endpoint, { method: "PUT", body, headers }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "DELETE", headers }),
};
