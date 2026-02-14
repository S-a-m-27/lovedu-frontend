const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const token = this.getToken()

      console.log(`📤 API Request: ${options.method || 'GET'} ${endpoint}`, {
        url,
        hasToken: !!token,
        tokenValid: token ? this.isValidJWT(token) : false,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      })

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      // Only add Authorization header if token is valid
      if (token && this.isValidJWT(token)) {
        headers['Authorization'] = `Bearer ${token}`
      } else if (token) {
        console.warn('⚠️ Skipping Authorization header - invalid token format')
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Robust response parsing (handles empty / non-JSON responses)
      const contentType = response.headers.get('content-type') || ''
      let data: any = {}
      let responseText = ''

      try {
        responseText = await response.clone().text()
        if (
          contentType.includes('application/json') ||
          responseText.trim().startsWith('{') ||
          responseText.trim().startsWith('[')
        ) {
          try {
            data = responseText ? JSON.parse(responseText) : {}
          } catch (jsonError) {
            console.error('⚠️ Failed to parse JSON response:', jsonError)
            data = {
              detail: responseText || `HTTP ${response.status}: ${response.statusText}`,
              raw_response: responseText.substring(0, 500)
            }
          }
        } else {
          data = {
            detail: responseText || `HTTP ${response.status}: ${response.statusText}`,
            raw_response: responseText.substring(0, 500)
          }
        }
      } catch (readError) {
        data = {
          detail: `HTTP ${response.status}: ${response.statusText}`,
          error_reading_response: readError instanceof Error ? readError.message : String(readError)
        }
      }

      if (!response.ok) {
        const errorMsg =
          data?.detail ||
          data?.message ||
          data?.error ||
          (typeof data === 'string' ? data : null) ||
          `HTTP ${response.status}: ${response.statusText}` ||
          'An error occurred'
        
        // Clear invalid tokens on authentication errors (401, 403)
        // Especially for malformed token errors
        if (response.status === 401 || response.status === 403) {
          const errorStr = String(errorMsg).toLowerCase()
          if (
            errorStr.includes('invalid token') ||
            errorStr.includes('malformed') ||
            errorStr.includes('invalid number of segments') ||
            errorStr.includes('unable to parse') ||
            errorStr.includes('token format')
          ) {
            console.warn('⚠️ Invalid/malformed token detected, clearing tokens...')
            this.clearToken()
          }
        }
        
        console.error(`❌ API Error (${response.status}): ${endpoint}`, {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorMsg,
          data,
          contentType,
          responseText: responseText.substring(0, 500)
        })
        return {
          error: errorMsg,
        }
      }

      console.log(`✅ API Success: ${endpoint}`, {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : []
      })

      return { data }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred'
      console.error(`❌ API Network Error: ${endpoint}`, {
        url: `${this.baseURL}${endpoint}`,
        error: errorMsg,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      })
      return {
        error: errorMsg,
      }
    }
  }

  private isValidJWT(token: string): boolean {
    if (!token || typeof token !== 'string') return false
    if (token === 'null' || token === 'undefined' || token.trim() === '') return false
    
    // JWT should have exactly 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Each part should be non-empty
    return parts.every(part => part.length > 0)
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      // Validate token format (JWT should have 3 parts separated by dots)
      if (this.isValidJWT(token)) {
        console.log('🔑 Token retrieved from auth_token:', token.substring(0, 20) + '...')
        return token
      } else {
        console.warn('⚠️ Invalid token format in auth_token, clearing...', {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 30),
          parts: token.split('.').length
        })
        localStorage.removeItem('auth_token')
      }
    }

    // Try to get from stored session
    const storedSession = localStorage.getItem('auth_session')
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        const sessionToken = session?.access_token || null
        if (sessionToken) {
          if (this.isValidJWT(sessionToken)) {
            console.log('🔑 Token retrieved from auth_session:', sessionToken.substring(0, 20) + '...')
            return sessionToken
          } else {
            console.warn('⚠️ Invalid token format in auth_session, clearing...', {
              tokenLength: sessionToken.length,
              tokenPreview: sessionToken.substring(0, 30),
              parts: sessionToken.split('.').length
            })
            localStorage.removeItem('auth_session')
          }
        }
      } catch {
        return null
      }
    }

    console.warn('⚠️ No valid token found in storage')
    return null
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_session')
    }
  }

  // Auth endpoints
  async verifyToken(token: string) {
    // For verify-token, send token in body, not Authorization header
    const url = `${this.baseURL}/auth/verify-token`
    
    try {
      console.log(`📤 API Request: POST /auth/verify-token`, {
        tokenInBody: true,
        tokenLength: token?.length || 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
        url: url
      })

      const response = await fetch(url, {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({ token }),
    })

      // Check content-type before parsing JSON
      const contentType = response.headers.get('content-type') || ''
      let data: any = {}
      let responseText = ''
      
      try {
        // Try to get response as text first
        responseText = await response.clone().text()
        
        // Parse JSON if content-type indicates JSON or if text looks like JSON
        if (contentType.includes('application/json') || (responseText.trim().startsWith('{') || responseText.trim().startsWith('['))) {
          try {
            data = JSON.parse(responseText)
          } catch (jsonError) {
            console.error('⚠️ Failed to parse JSON response:', jsonError)
            data = { 
              detail: responseText || `HTTP ${response.status}: ${response.statusText}`,
              raw_response: responseText.substring(0, 500) // Limit length
            }
          }
        } else {
          // Not JSON, use text as error message
          data = { 
            detail: responseText || `HTTP ${response.status}: ${response.statusText}`,
            raw_response: responseText.substring(0, 500)
          }
        }
      } catch (textError) {
        console.error('⚠️ Failed to read response text:', textError)
        data = { 
          detail: `HTTP ${response.status}: ${response.statusText}`,
          error_reading_response: textError instanceof Error ? textError.message : String(textError)
        }
      }

      if (!response.ok) {
        // Extract error message from multiple possible fields
        const errorMsg = data.detail || 
                        data.message || 
                        data.error || 
                        (typeof data === 'string' ? data : null) ||
                        `HTTP ${response.status}: ${response.statusText}` || 
                        'An error occurred'
        
        // Log comprehensive error information
        console.error(`❌ API Error (${response.status}): /auth/verify-token`, {
          status: response.status,
          statusText: response.statusText,
          statusCode: response.status,
          error: errorMsg,
          data: data,
          contentType: contentType,
          responseText: responseText.substring(0, 500), // First 500 chars
          hasData: !!data,
          dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
          url: url
        })
        
        return {
          error: errorMsg,
          status: response.status,
          details: data
        }
      }

      console.log(`✅ API Success: /auth/verify-token`, {
        status: response.status,
        hasData: !!data,
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
        contentType: contentType
      })

      return { data }
    } catch (error) {
      // Network errors, fetch failures, etc.
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      console.error(`❌ API Network Error: /auth/verify-token`, {
        error: errorMsg,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorStack: errorStack,
        url: url,
        tokenLength: token?.length || 0
      })
      
      return {
        error: errorMsg,
        isNetworkError: true
      }
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  async getUserById(userId: string) {
    return this.request(`/auth/user/${userId}`)
  }

  async updateProfile(fullName?: string, dateOfBirth?: string) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        full_name: fullName,
        date_of_birth: dateOfBirth,
      }),
    })
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(email: string, password: string, user_metadata?: Record<string, any>, full_name?: string, date_of_birth?: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        user_metadata,
        full_name,
        date_of_birth
      }),
    })
  }

  // Chat endpoints
  async sendChatMessage(message: string, assistantId: string, mode: string, chatSessionId?: string, courseId?: string) {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        assistant_id: assistantId,
        mode,
        chat_session_id: chatSessionId || null,
        course_id: courseId || null,
      }),
    })
  }

  async getChatSessions() {
    return this.request<Array<{
      id: string
      user_id: string
      assistant_id: string
      created_at: string
      updated_at: string
      message_count: number
      course_id?: string | null
      course_name?: string | null
    }>>('/chat/sessions')
  }

  async getChatSession(sessionId: string) {
    return this.request<{
      session: {
        id: string
        user_id: string
        assistant_id: string
        created_at: string
        updated_at: string
        message_count: number
        course_id?: string | null
        course_name?: string | null
      }
      messages: Array<{
        id: string
        content: string
        role: string
        timestamp: string
        source?: string
      }>
    }>(`/chat/sessions/${sessionId}`)
  }

  async createChatSession(assistantId: string) {
    return this.request('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ assistant_id: assistantId }),
    })
  }

  async deleteChatSession(sessionId: string) {
    return this.request(`/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  }

  // Subscription endpoints
  async getPlanInfo() {
    return this.request<{
      plan: 'free' | 'basic' | 'pro'
      tokens_limit: number
      pdf_uploads_per_day: number
      images_per_day: number
      tokens_used_today: number
      pdf_uploads_today: number
      images_uploaded_today: number
      tokens_remaining: number
      price_per_month: number | null
    }>('/subscription/plan')
  }

  async upgradePlan(plan: 'basic' | 'pro') {
    return this.request<{
      plan: 'free' | 'basic' | 'pro'
      tokens_limit: number
      pdf_uploads_per_day: number
      images_per_day: number
      tokens_used_today: number
      pdf_uploads_today: number
      images_uploaded_today: number
      tokens_remaining: number
      price_per_month: number | null
    }>('/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    })
  }

  async downgradePlan() {
    return this.request<{
      plan: 'free' | 'basic' | 'pro'
      tokens_limit: number
      pdf_uploads_per_day: number
      images_per_day: number
      tokens_used_today: number
      pdf_uploads_today: number
      images_uploaded_today: number
      tokens_remaining: number
      price_per_month: number | null
    }>('/subscription/downgrade', {
      method: 'POST',
    })
  }

  // Admin endpoints
  async uploadFile(assistantId: string, file: File) {
    const formData = new FormData()
    formData.append('assistant_id', assistantId)
    formData.append('file', file)

    const token = this.getToken()
    const url = `${this.baseURL}/admin/upload`

    try {
      const headers: HeadersInit = {}
      
      // Only add Authorization header if token is valid
      if (token && this.isValidJWT(token)) {
        headers['Authorization'] = `Bearer ${token}`
      } else if (token) {
        console.warn('⚠️ Skipping Authorization header in uploadFile - invalid token format')
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.detail || data.message || 'Upload failed',
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
      }
    }
  }

  async getFiles(assistantId: string) {
    return this.request<{
      files: Array<{
        id: string
        assistant_id: string
        file_name: string
        file_url: string | null
        file_size: number | null
        uploaded_at: string
        uploaded_by: string
      }>
      total: number
    }>(`/admin/files/${assistantId}`)
  }

  async deleteFile(assistantId: string, fileName: string) {
    return this.request(`/admin/files/${assistantId}/${fileName}`, {
      method: 'DELETE',
    })
  }

  // Course endpoints
  async enrollCourse(courseCode: string) {
    return this.request<{
      id: string
      course_id: string
      course: {
        id: string
        code: string
        name: string
        description: string | null
      }
      enrolled_at: string
    }>('/course/enroll', {
      method: 'POST',
      body: JSON.stringify({ course_code: courseCode }),
    })
  }

  async getMyCourses() {
    return this.request<Array<{
      id: string
      course_id: string
      course: {
        id: string
        code: string
        name: string
        description: string | null
      }
      enrolled_at: string
    }>>('/course/my-courses')
  }

  async getAllCourses() {
    return this.request<Array<{
      id: string
      code: string
      name: string
      description: string | null
    }>>('/course/list')
  }

  async createCourse(code: string, name: string, description?: string) {
    return this.request<{
      id: string
      code: string
      name: string
      description: string | null
    }>('/course/create', {
      method: 'POST',
      body: JSON.stringify({ code, name, description }),
    })
  }

  async updateCourse(courseId: string, code?: string, name?: string, description?: string) {
    return this.request<{
      id: string
      code: string
      name: string
      description: string | null
    }>(`/course/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify({ code, name, description }),
    })
  }

  async deleteCourse(courseId: string) {
    return this.request(`/course/${courseId}`, {
      method: 'DELETE',
    })
  }

  // Course file management (admin only)
  async uploadCourseFile(courseId: string, file: File, fileType: 'behavior' | 'content' = 'content') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type', fileType)

    const token = this.getToken()
    const url = `${this.baseURL}/admin/courses/${courseId}/upload`

    try {
      const headers: HeadersInit = {}
      
      // Only add Authorization header if token is valid
      if (token && this.isValidJWT(token)) {
        headers['Authorization'] = `Bearer ${token}`
      } else if (token) {
        console.warn('⚠️ Skipping Authorization header in uploadCourseFile - invalid token format')
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.detail || data.message || 'Upload failed',
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
      }
    }
  }

  async getCourseFiles(courseId: string) {
    return this.request<{
      files: Array<{
        id: string
        assistant_id: string
        file_name: string
        file_url: string | null
        file_size: number | null
        uploaded_at: string
        uploaded_by: string
        file_type?: 'behavior' | 'content'
      }>
      total: number
    }>(`/admin/courses/${courseId}/files`)
  }

  async deleteCourseFile(courseId: string, fileName: string) {
    return this.request(`/admin/courses/${courseId}/files/${fileName}`, {
      method: 'DELETE',
    })
  }

  getFileDownloadUrl(assistantId: string, fileName: string): string {
    const baseUrl = this.baseURL
    return `${baseUrl}/admin/files/${assistantId}/${encodeURIComponent(fileName)}/download`
  }

  getCourseFileDownloadUrl(courseId: string, fileName: string): string {
    const baseUrl = this.baseURL
    return `${baseUrl}/admin/courses/${courseId}/files/${encodeURIComponent(fileName)}/download`
  }
}

export const apiClient = new ApiClient()

