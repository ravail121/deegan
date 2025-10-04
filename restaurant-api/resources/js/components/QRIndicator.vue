<template>
  <div v-if="qrStore.hasQRData" class="qr-indicator">
    <div class="qr-banner">
      <span class="qr-icon">🍽️</span>
      <span class="qr-text">{{ qrStore.getQRDisplayText }}</span>
      <button class="qr-clear" @click="clearQRData" aria-label="Clear table info">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { useQRStore } from '../stores/qrStore.js'

export default {
  name: 'QRIndicator',
  setup() {
    const qrStore = useQRStore()
    
    const clearQRData = () => {
      qrStore.clearQRData()
    }
    
    return {
      qrStore,
      clearQRData
    }
  }
}
</script>

<style scoped>
.qr-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  pointer-events: none;
}

.qr-banner {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.qr-icon {
  font-size: 16px;
}

.qr-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  flex: 1;
}

.qr-clear {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: background-color 0.2s ease;
}

.qr-clear:hover {
  background: rgba(255, 255, 255, 0.3);
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

/* Add top padding to body when QR banner is shown */
body:has(.qr-indicator) {
  padding-top: 40px;
}
</style>
