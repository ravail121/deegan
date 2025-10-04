<template>
  <div v-if="tableStore.shouldShowTableIndicator" class="table-indicator">
    <div class="table-banner">
      <span class="table-icon">🪑</span>
      <span class="table-text">Table: {{ tableStore.getTableDisplayName }}</span>
      <button class="clear-btn" @click="hidePopup" aria-label="Hide table indicator">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { useTableStore } from '../stores/tableStore.js'

export default {
  name: 'TableIndicator',
  setup() {
    const tableStore = useTableStore()
    
    const hidePopup = () => {
      tableStore.hideTableIndicator()
    }
    
    return {
      tableStore,
      hidePopup
    }
  }
}
</script>

<style scoped>
.table-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  pointer-events: none;
}

.table-banner {
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

.table-icon {
  font-size: 16px;
}

.table-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.clear-btn {
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
  transition: background-color 0.2s;
}

.clear-btn:hover {
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

/* Add top padding to body when table banner is shown */
body:has(.table-indicator) {
  padding-top: 40px;
}
</style>
