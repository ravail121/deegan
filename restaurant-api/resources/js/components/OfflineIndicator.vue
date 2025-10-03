<template>
  <div v-if="!isOnline" class="offline-indicator">
    <div class="offline-banner">
      <span class="offline-icon">📡</span>
      <span class="offline-text">You're offline - showing cached data</span>
    </div>
  </div>
</template>

<script>
import { useOfflineStore } from '../stores/offlineStore.js'

export default {
  name: 'OfflineIndicator',
  setup() {
    const offlineStore = useOfflineStore()
    
    return {
      isOnline: offlineStore.isOnline
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
}

.offline-icon {
  margin-right: 8px;
  font-size: 16px;
}

.offline-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
