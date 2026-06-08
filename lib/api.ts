/**
 * API Service - centralized HTTP client for backend communication.
 * ALL requests go through Next.js API proxy routes (/api/...) to avoid CORS issues.
 * The proxy forwards cookies to the backend automatically.
 */

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Makes an authenticated request through the Next.js API proxy.
 * All calls go to /api/proxy?path=<endpoint> which forwards to the backend
 * with proper cookie handling (no CORS issues since same-origin).
 * If a 401 is received, it attempts a token refresh and retries once.
 */
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  // Route through Next.js API proxy to avoid CORS
  const proxyUrl = `/api/proxy?path=${encodeURIComponent(endpoint)}`
  let res = await fetch(proxyUrl, config)

  // If unauthorized, attempt silent refresh and retry
  if (res.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
    })

    if (refreshRes.ok) {
      // Retry original request
      res = await fetch(proxyUrl, config)
    } else {
      throw new ApiError(401, 'Sesion expirada. Por favor inicia sesion nuevamente.')
    }
  }

  // Handle non-JSON responses (like 204 No Content)
  if (res.status === 204) {
    return undefined as T
  }

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.message || `Error ${res.status}`,
      data
    )
  }

  return data as T
}

export { apiRequest, ApiError }
export type { RequestOptions }
