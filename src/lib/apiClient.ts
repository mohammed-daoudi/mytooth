/**
 * Enhanced API Client with proactive token refresh, request queuing, and optimized retry logic
 */

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
  skipRefreshQueue?: boolean; // Skip queuing for auth-related requests
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

interface QueuedRequest {
  url: string;
  config: ApiRequestConfig;
  resolve: (value: ApiResponse<any>) => void;
  reject: (reason?: any) => void;
  attempt: number;
}

class ApiClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  private requestQueue: QueuedRequest[] = [];
  private refreshThreshold: number = 5 * 60 * 1000; // 5 minutes before expiration

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;

    // Start proactive token monitoring
    this.startTokenMonitoring();
  }

  private async getAuthToken(): Promise<string | null> {
    return localStorage.getItem('auth-token');
  }

  private async getTokenExpiration(): Promise<Date | null> {
    const token = await this.getAuthToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? new Date(payload.exp * 1000) : null;
    } catch {
      return null;
    }
  }

  private async shouldRefreshToken(): Promise<boolean> {
    const expiration = await this.getTokenExpiration();
    if (!expiration) return false;

    const now = new Date();
    const timeUntilExpiration = expiration.getTime() - now.getTime();

    return timeUntilExpiration <= this.refreshThreshold;
  }

  private startTokenMonitoring(): void {
    // Check every 30 seconds for proactive refresh
    setInterval(async () => {
      const token = await this.getAuthToken();
      if (token && !this.isRefreshing && await this.shouldRefreshToken()) {
        console.log('🔄 Proactively refreshing token before expiration...');
        await this.refreshToken();
      }
    }, 30 * 1000);
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    const result = await this.refreshPromise;

    this.isRefreshing = false;
    this.refreshPromise = null;

    // Process queued requests after refresh
    await this.processQueuedRequests();

    return result;
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const storedToken = await this.getAuthToken();
      if (!storedToken) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.accessToken;

        // Update stored token
        localStorage.setItem('auth-token', newToken);

        // Update cookie with secure settings
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `auth-token=${newToken}; expires=${expires.toUTCString()}; path=/; samesite=strict${isSecure ? '; secure' : ''}`;

        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.log('❌ Token refresh failed:', response.status);
        this.handleRefreshFailure();
        return false;
      }
    } catch (error) {
      console.error('🚨 Token refresh error:', error);
      this.handleRefreshFailure();
      return false;
    }
  }

  private handleRefreshFailure(): void {
    // Clear invalid tokens
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; samesite=strict';

    // Clear the request queue
    this.requestQueue.forEach(request => {
      request.resolve({
        success: false,
        error: 'Authentication session expired. Please login again.',
        status: 401
      });
    });
    this.requestQueue = [];

    // Redirect to login if not already there
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login?expired=true';
    }
  }

  private async processQueuedRequests(): Promise<void> {
    const requests = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of requests) {
      try {
        const result = await this.makeRequest(
          request.url,
          { ...request.config, skipRefreshQueue: true },
          request.attempt
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  private async makeRequest<T = any>(
    url: string,
    config: ApiRequestConfig,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = true,
      skipRefreshQueue = false
    } = config;

    // If refreshing and this isn't a refresh-related request, queue it
    if (this.isRefreshing && requireAuth && !skipRefreshQueue) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({
          url,
          config,
          resolve,
          reject,
          attempt
        });
      });
    }

    // Check if token should be refreshed proactively
    if (requireAuth && !skipRefreshQueue && await this.shouldRefreshToken()) {
      await this.refreshToken();
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add auth token if required
    if (requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      } else {
        return {
          success: false,
          error: 'No authentication token available',
          status: 401
        };
      }
    }

    // Prepare request
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${url}`, requestConfig);
      const responseData = await response.json().catch(() => ({}));

      // Handle 401 errors with enhanced retry logic
      if (response.status === 401 && requireAuth && attempt <= this.maxRetries && !skipRefreshQueue) {
        const isExpiredToken = responseData.error?.includes('expired') ||
                               responseData.needsRefresh === true ||
                               responseData.error?.includes('invalid token');

        if (isExpiredToken) {
          console.log(`🔄 Token expired on attempt ${attempt}, refreshing...`);
          const refreshSuccess = await this.refreshToken();

          if (refreshSuccess) {
            console.log('✅ Token refreshed, retrying request...');
            // Exponential backoff for retries
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));

            return this.makeRequest<T>(url, { ...config, skipRefreshQueue: true }, attempt + 1);
          } else {
            console.log('❌ Token refresh failed after multiple attempts');
            return {
              success: false,
              error: 'Authentication failed. Please login again.',
              status: 401
            };
          }
        }
      }

      return {
        success: response.ok,
        data: responseData,
        error: response.ok ? undefined : (responseData.error || responseData.message || `HTTP ${response.status}`),
        status: response.status
      };

    } catch (error) {
      console.error(`API request failed (attempt ${attempt}):`, error);

      // Retry on network errors with exponential backoff
      if (attempt < this.maxRetries && !skipRefreshQueue) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`🔄 Retrying request in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(url, config, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  // Convenience methods
  async get<T = any>(url: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(url: string, body?: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'POST', body });
  }

  async put<T = any>(url: string, body?: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PUT', body });
  }

  async patch<T = any>(url: string, body?: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PATCH', body });
  }

  async delete<T = any>(url: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  // Utility methods
  async isTokenValid(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    const expiration = await this.getTokenExpiration();
    if (!expiration) return false;

    return expiration.getTime() > Date.now();
  }

  async getTimeUntilExpiration(): Promise<number | null> {
    const expiration = await this.getTokenExpiration();
    if (!expiration) return null;

    return Math.max(0, expiration.getTime() - Date.now());
  }

  // Manual refresh trigger
  async forceRefresh(): Promise<boolean> {
    return this.refreshToken();
  }

  // Clear all queued requests (useful for logout)
  clearQueue(): void {
    this.requestQueue.forEach(request => {
      request.resolve({
        success: false,
        error: 'Request cancelled',
        status: 0
      });
    });
    this.requestQueue = [];
  }
}

// Default instance
export const apiClient = new ApiClient();

// Export the class for custom instances
export { ApiClient };

// Export response type for use in components
export type { ApiResponse };
