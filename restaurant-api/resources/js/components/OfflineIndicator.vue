<template>
  <div v-if="!isOnline && showBanner" class="offline-indicator">
    <div class="offline-banner">
      <span class="offline-icon">{{ t('Offline.icon') }}</span>
      <span class="offline-text">{{ t('Offline.message') }}</span>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useOfflineStore } from '../stores/offlineStore.js'
import { t } from '../config/appText.js'

export default {
  name: 'OfflineIndicator',
  setup() {
    const offlineStore = useOfflineStore()
    const showBanner = ref(false)
    let hideTimer = null
    
    const hideBannerAfterDelay = () => {
      // Clear any existing timer
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
      
      // Show banner immediately when going offline
      showBanner.value = true
      
      // Hide banner after 2.5 seconds with fade out
      hideTimer = setTimeout(() => {
        showBanner.value = false
      }, 2500)
    }
    
    // Watch for offline status changes
    watch(() => offlineStore.isOnline, (isOnline) => {
      if (!isOnline) {
        hideBannerAfterDelay()
      } else {
        // Clear timer and hide banner when coming back online
        if (hideTimer) {
          clearTimeout(hideTimer)
        }
        showBanner.value = false
      }
    })
    
    onUnmounted(() => {
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
    })
    
    return {
      isOnline: offlineStore.isOnline,
      showBanner,
      t
    }
  }
}
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.offline-banner {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
  transition: opacity 0.3s ease-out;
}

.offline-indicator.fade-out .offline-banner {
  opacity: 0;
}

.offline-icon {
  margin-right: 8px;
  font-size: 16px;
}

.offline-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Add top padding to body when offline banner is shown */
body:has(.offline-indicator) {
  padding-top: 40px;
}
</style>
