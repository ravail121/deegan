<template>
  <div id="app">
    <OfflineIndicator />
    <TableIndicator />
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
import { useSettingsStore } from './stores/settingsStore.js'
import { useTableStore } from './stores/tableStore.js'
import OfflineIndicator from './components/OfflineIndicator.vue'
import TableIndicator from './components/TableIndicator.vue'

export default {
  name: 'App',
  components: {
    OfflineIndicator,
    TableIndicator
  },
  setup() {
    const offlineStore = useOfflineStore()
    const settingsStore = useSettingsStore()
    const tableStore = useTableStore()
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
        // Initialize table store first (handle QR code parameters)
        tableStore.initializeTableStore()
        
        // Initialize system settings
        await settingsStore.initializeSettings()
        
        // Initialize offline store
        await offlineStore.initializeApp()
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
