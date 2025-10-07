import envConfig from '@/config'

type HttpOptions = {
  headers?: Record<string, string>
  contentType?: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

class HttpClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || envConfig.NEXT_PUBLIC_API_ENDPOINT
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private buildHeaders(options?: HttpOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': options?.contentType || 'application/json'
    }

    // Thêm access token vào header nếu có
    const accessToken = this.getAccessToken()
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    // Merge với headers tùy chỉnh
    if (options?.headers) {
      Object.assign(headers, options.headers)
    }

    return headers
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: HttpOptions
  ) {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseUrl}/api/admin${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    const headers = this.buildHeaders(options)
    
    const config: RequestInit = {
      method,
      headers
    }

    // Thêm body cho POST, PUT, DELETE
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data)
    }

    const response: Response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP Error: ${response.status}`)
    }

    return response.json()
  }

  get(endpoint: string, options?: HttpOptions) {
    return this.request('GET', endpoint, undefined, options)
  }

  post(endpoint: string, data?: any, options?: HttpOptions){
    return this.request('POST', endpoint, data, options)
  }

  put(endpoint: string, data?: any, options?: HttpOptions) {
    return this.request('PUT', endpoint, data, options)
  }

  delete(endpoint: string, data?: any, options?: HttpOptions) {
    return this.request('DELETE', endpoint, data, options)
  }
}

// Export instance mặc định
const http = new HttpClient()
export default http

// Export class để có thể tạo instance mới với baseUrl khác
export { HttpClient }