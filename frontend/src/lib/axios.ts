import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

const useMock = typeof window !== 'undefined' && window.location.hostname.includes('github.io')

function setupInterceptors() {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) throw new Error('No refresh token')
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = data.data || data
          localStorage.setItem('accessToken', accessToken)
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/auth/login'
          return Promise.reject(error)
        }
      }
      return Promise.reject(error)
    }
  )
}

if (useMock) {
  import('./mock-handler').then(({ handleMockRequest }) => {
    api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken')
        if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
        const result = handleMockRequest(config)
        if (result) return Promise.reject({ ...result, __mock: true, config })
        return config
      },
      (error) => Promise.reject(error)
    )

    api.interceptors.response.use(
      (response) => response,
      async (error: any) => {
        if (error.__mock) {
          return Promise.resolve({ data: error.data, status: error.status, statusText: error.statusText, headers: error.headers, config: error.config })
        }
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) throw new Error('No refresh token')
            const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
            const { accessToken, refreshToken: newRefreshToken } = data.data || data
            localStorage.setItem('accessToken', accessToken)
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          } catch {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            window.location.href = '/auth/login'
            return Promise.reject(error)
          }
        }
        return Promise.reject(error)
      }
    )
  }).catch(() => setupInterceptors())
} else {
  setupInterceptors()
}

export default api
