<template>
  <div id="app">
    <OfflineIndicator />
    <router-view v-if="isInitialized" />
    <div v-else class="loading-screen">
      <div class="loading-content">
        <img src="/logo.png" alt="Deegaan Restaurant" class="loading-logo" />
        <h2>Loading...</h2>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import { useOfflineStore } from './stores/offlineStore.js'
import OfflineIndicator from './components/OfflineIndicator.vue'

export default {
  name: 'App',
  components: {
    OfflineIndicator
  },
  setup() {
    const offlineStore = useOfflineStore()
    const isInitialized = ref(false)

    const handleOnline = () => {
      offlineStore.setOnlineStatus(true)
    }

    const handleOffline = () => {
      offlineStore.setOnlineStatus(false)
    }

    onMounted(async () => {
      // Set initial online status
      offlineStore.setOnlineStatus(navigator.onLine)
      
      // Load cached data on app start
      offlineStore.loadCachedData()
      
      // Set up online/offline listeners
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      // Initialize app - fetch all data and preload images
      try {
        await offlineStore.initializeApp()
        console.log('App initialization completed successfully')
      } catch (error) {
        console.error('App initialization failed:', error)
      }
      
      // App is ready
      isInitialized.value = true
    })

    onUnmounted(() => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    })

    return {
      isInitialized
    }
  }
}
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0b0f12;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  border-radius: 50%;
}

.loading-content h2 {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: #ffffff;
}
</style>
