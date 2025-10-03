// API Configuration
export const API_CONFIG = {
  // Use empty string for relative URLs (Vite proxy will handle routing)
  BASE_URL: '',
  
  // API Endpoints
  ENDPOINTS: {
    PACKAGES: '/api/packages',
    ITEMS: '/api/items',
    ITEMS_BY_PACKAGE: '/api/items/package'
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
