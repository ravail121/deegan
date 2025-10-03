import { defineStore } from 'pinia'
import { API_CONFIG, getApiUrl } from '../config/api.js'
import { indexedDBStorage } from './indexedDB.js'

export const useOfflineStore = defineStore('offline', {
  state: () => ({
    packages: [],
    items: [],
    lastUpdated: null,
    isOnline: navigator.onLine,
    offlineData: {
      packages: [],
      items: []
    }
  }),

  getters: {
    getCachedPackages: (state) => state.offlineData.packages,
    getCachedItems: (state) => state.offlineData.items,
    hasOfflineData: (state) => state.offlineData.packages.length > 0 || state.offlineData.items.length > 0
  },

  actions: {
    // Set online/offline status
    setOnlineStatus(isOnline) {
      this.isOnline = isOnline
    },

    // Cache API data for offline use
    async cacheData(data, type) {
      if (type === 'packages') {
        this.offlineData.packages = data
        // Store in IndexedDB for better persistence
        try {
          await indexedDBStorage.storePackages(data)
        } catch (error) {
          console.error('Failed to store packages in IndexedDB:', error)
        }
      } else if (type === 'items') {
        this.offlineData.items = data
        // Store in IndexedDB for better persistence
        try {
          await indexedDBStorage.storeItems(data)
        } catch (error) {
          console.error('Failed to store items in IndexedDB:', error)
        }
      }
      this.lastUpdated = new Date().toISOString()
      
      // Store in localStorage as backup
      localStorage.setItem('deegaan_offline_data', JSON.stringify({
        packages: this.offlineData.packages,
        items: this.offlineData.items,
        lastUpdated: this.lastUpdated
      }))
      
      // Preload images when data is cached
      this.preloadImages(data, type)
    },

    // Load cached data from IndexedDB and localStorage
    async loadCachedData() {
      try {
        // Try IndexedDB first
        const [packages, items] = await Promise.all([
          indexedDBStorage.getPackages(),
          indexedDBStorage.getItems()
        ])
        
        if (packages.length > 0 || items.length > 0) {
          this.offlineData.packages = packages
          this.offlineData.items = items
          console.log('Loaded data from IndexedDB:', { packages: packages.length, items: items.length })
        } else {
          // Fallback to localStorage
          const cached = localStorage.getItem('deegaan_offline_data')
          if (cached) {
            const data = JSON.parse(cached)
            this.offlineData.packages = data.packages || []
            this.offlineData.items = data.items || []
            this.lastUpdated = data.lastUpdated
            console.log('Loaded data from localStorage')
          }
        }
      } catch (error) {
        console.error('Failed to load cached data:', error)
        // Fallback to localStorage
        try {
          const cached = localStorage.getItem('deegaan_offline_data')
          if (cached) {
            const data = JSON.parse(cached)
            this.offlineData.packages = data.packages || []
            this.offlineData.items = data.items || []
            this.lastUpdated = data.lastUpdated
          }
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError)
        }
      }
    },

    // Fetch data with offline fallback
    async fetchWithOfflineFallback(url, type) {
      try {
        if (this.isOnline) {
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            this.cacheData(data.data || data, type)
            return data
          }
        }
      } catch (error) {
        console.log('Network request failed, using cached data:', error)
      }

      // Return cached data if online request fails or offline
      const cachedData = type === 'packages' ? this.offlineData.packages : this.offlineData.items
      
      if (cachedData.length > 0) {
        return {
          success: true,
          data: cachedData,
          cached: true
        }
      } else {
        // No cached data available
        return {
          success: false,
          data: [],
          cached: false,
          error: 'No cached data available and offline'
        }
      }
    },

    // Fetch packages with offline support
    async fetchPackages() {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.PACKAGES)
      return await this.fetchWithOfflineFallback(url, 'packages')
    },

    // Fetch items with offline support
    async fetchItems() {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ITEMS)
      return await this.fetchWithOfflineFallback(url, 'items')
    },

    // Fetch items by package with offline support
    async fetchItemsByPackage(packageId) {
      const url = getApiUrl(`${API_CONFIG.ENDPOINTS.ITEMS_BY_PACKAGE}/${packageId}`)
      return await this.fetchWithOfflineFallback(url, 'items')
    },

    // Preload images for offline use
    preloadImages(data, type) {
      if (!data || !Array.isArray(data)) return
      
      console.log(`Preloading images for ${type}...`)
      
      data.forEach(item => {
        let imageUrl = null
        
        if (type === 'packages' && item.photo80) {
          imageUrl = `https://menu.deegaan.so/assets/images/meals/packages/small80/${item.photo80}`
        } else if (type === 'items' && item.photo320) {
          imageUrl = `https://menu.deegaan.so/assets/images/meals/items/middle320/${item.photo320}`
        }
        
        if (imageUrl) {
          this.preloadImage(imageUrl)
        }
      })
    },

    // Preload a single image
    preloadImage(url) {
      const img = new Image()
      img.onload = () => {
        console.log(`Image preloaded: ${url}`)
      }
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`)
      }
      img.src = url
    },

    // Preload all images when app starts
    async preloadAllImages() {
      console.log('Starting image preloading...')
      
      // Preload package images
      if (this.offlineData.packages.length > 0) {
        this.preloadImages(this.offlineData.packages, 'packages')
      }
      
      // Preload item images
      if (this.offlineData.items.length > 0) {
        this.preloadImages(this.offlineData.items, 'items')
      }
      
      console.log('Image preloading completed')
    },

    // Initialize app - fetch all data and preload images
    async initializeApp() {
      console.log('Initializing app - fetching all data and preloading images...')
      
      try {
        // Fetch all data in parallel
        const [packagesResult, itemsResult] = await Promise.all([
          this.fetchPackages(),
          this.fetchItems()
        ])
        
        console.log('Data fetching completed:', {
          packages: packagesResult.success,
          items: itemsResult.success
        })
        
        // Preload all images
        await this.preloadAllImages()
        
        console.log('App initialization completed')
        return true
      } catch (error) {
        console.error('App initialization failed:', error)
        return false
      }
    },

    // Clear all cached data
    clearCache() {
      this.offlineData.packages = []
      this.offlineData.items = []
      this.lastUpdated = null
      localStorage.removeItem('deegaan_offline_data')
    }
  }
})
