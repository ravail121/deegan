import { defineStore } from 'pinia'
import axios from 'axios'

export const useGuestSession = defineStore('guestSession', {
  state: () => ({
    token: null,
    guestId: null,
    expiresAt: null,
    isInitialized: false,
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isExpired: (state) => {
      if (!state.expiresAt) return false
      return new Date() >= new Date(state.expiresAt)
    },
    needsRefresh: (state) => {
      if (!state.expiresAt) return false
      // Refresh if token expires within 1 hour
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
      return new Date(state.expiresAt) <= oneHourFromNow
    }
  },

  actions: {
    // Initialize guest session on app start
    async initializeSession() {
      if (this.isInitialized) return

      try {
        this.isLoading = true
        
        // Check if we have a saved token
        const savedToken = localStorage.getItem('deegan-guest-token')
        const savedSession = localStorage.getItem('deegan-guest-session')
        
        if (savedToken && savedSession) {
          const sessionData = JSON.parse(savedSession)
          
          // Check if token is still valid
          if (sessionData.expiresAt && new Date() < new Date(sessionData.expiresAt)) {
            this.token = savedToken
            this.guestId = sessionData.guestId
            this.expiresAt = sessionData.expiresAt
            
            // Set up axios interceptor
            this.setupAxiosInterceptor()
            
            // Verify token is still valid
            try {
              await this.verifySession()
            } catch (error) {
              // Token is invalid, create new session
              await this.createNewSession()
            }
          } else {
            // Token expired, create new session
            await this.createNewSession()
          }
        } else {
          // No saved session, create new one
          await this.createNewSession()
        }
        
        this.isInitialized = true
      } catch (error) {
        console.error('Failed to initialize guest session:', error)
        // Fallback: create new session
        await this.createNewSession()
        this.isInitialized = true
      } finally {
        this.isLoading = false
      }
    },

    // Create a new guest session
    async createNewSession() {
      try {
        const response = await axios.post('/api/guest/session')
        
        if (response.data.success) {
          const { token, guest_id, expires_at } = response.data.data
          
          this.token = token
          this.guestId = guest_id
          this.expiresAt = expires_at
          
          // Save to localStorage
          this.saveToStorage()
          
          // Set up axios interceptor
          this.setupAxiosInterceptor()
          
          return true
        }
      } catch (error) {
        console.error('Failed to create guest session:', error)
        throw error
      }
    },

    // Refresh the current session
    async refreshSession() {
      try {
        const response = await axios.post('/api/guest/session/refresh')
        
        if (response.data.success) {
          const { token, expires_at } = response.data.data
          
          this.token = token
          this.expiresAt = expires_at
          
          // Save to localStorage
          this.saveToStorage()
          
          return true
        }
      } catch (error) {
        console.error('Failed to refresh guest session:', error)
        // If refresh fails, create new session
        await this.createNewSession()
      }
    },

    // Verify current session
    async verifySession() {
      try {
        const response = await axios.get('/api/guest/session')
        return response.data.success
      } catch (error) {
        throw error
      }
    },

    // Update session data
    async updateSessionData(key, value) {
      try {
        await axios.post('/api/guest/session/data', {
          key,
          value
        })
        return true
      } catch (error) {
        console.error('Failed to update session data:', error)
        return false
      }
    },

    // Set up axios interceptor to include token in requests
    setupAxiosInterceptor() {
      // Remove existing interceptor if any
      axios.interceptors.request.eject(this.requestInterceptorId)
      
      // Add new interceptor
      this.requestInterceptorId = axios.interceptors.request.use(
        (config) => {
          // Add token to all API requests
          if (this.token && config.url?.includes('/api/')) {
            config.headers.Authorization = `Bearer ${this.token}`
          }
          return config
        },
        (error) => {
          return Promise.reject(error)
        }
      )

      // Add response interceptor to handle token expiration
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 401) {
            // Token expired, try to refresh
            try {
              await this.refreshSession()
              // Retry the original request
              const originalRequest = error.config
              originalRequest.headers.Authorization = `Bearer ${this.token}`
              return axios(originalRequest)
            } catch (refreshError) {
              // Refresh failed, redirect to login or handle as needed
              console.error('Session refresh failed:', refreshError)
            }
          }
          return Promise.reject(error)
        }
      )
    },

    // Save session to localStorage
    saveToStorage() {
      if (this.token && this.guestId && this.expiresAt) {
        localStorage.setItem('deegan-guest-token', this.token)
        localStorage.setItem('deegan-guest-session', JSON.stringify({
          guestId: this.guestId,
          expiresAt: this.expiresAt
        }))
      }
    },

    // Clear session
    clearSession() {
      this.token = null
      this.guestId = null
      this.expiresAt = null
      this.isInitialized = false
      
      // Remove from localStorage
      localStorage.removeItem('deegan-guest-token')
      localStorage.removeItem('deegan-guest-session')
      
      // Remove axios interceptor
      if (this.requestInterceptorId) {
        axios.interceptors.request.eject(this.requestInterceptorId)
      }
    },

    // Auto-refresh token if needed
    async autoRefreshIfNeeded() {
      if (this.needsRefresh && this.isAuthenticated) {
        try {
          await this.refreshSession()
        } catch (error) {
          console.error('Auto-refresh failed:', error)
        }
      }
    }
  }
})
