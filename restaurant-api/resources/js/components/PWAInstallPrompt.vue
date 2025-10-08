<template>
  <!-- iOS Install Banner -->
  <Transition name="slide-up">
    <div 
      v-if="showBanner" 
      class="pwa-install-banner"
      :class="{ 'dark-theme': prefersDark, 'rtl': isRTL }"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      @keydown.esc="dismissBanner"
    >
      <div class="banner-content">
        <!-- Icon -->
        <div class="banner-icon">
          <img src="/icon-192.png" alt="Deegaan Restaurant App Icon" class="app-icon" />
        </div>

        <!-- Content -->
        <div class="banner-text">
          <h3 id="pwa-install-title" class="banner-title">{{ t('PWAInstall.title') }}</h3>
          <p id="pwa-install-description" class="banner-description">
            {{ installInstructions }}
          </p>
        </div>

        <!-- Visual hint animation -->
        <div 
          v-if="!prefersReducedMotion" 
          class="hint-animation"
          :class="{ 'ipad-position': isIPad }"
          :aria-hidden="true"
        >
          <!-- Animated arrow/hand pointing to Share button -->
          <div class="pulse-arrow" :class="{ 'arrow-up': isIPad, 'arrow-down': !isIPad }">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path v-if="isIPad" d="M12 4l-8 8h5v8h6v-8h5z"/>
              <path v-else d="M12 20l-8-8h5V4h6v8h5z"/>
            </svg>
          </div>
        </div>

        <!-- Action button (optional quick reminder) -->
        <button class="action-btn" @click="dismissBanner">
          {{ t('PWAInstall.dismissButton') }}
        </button>
      </div>
    </div>
  </Transition>

  <!-- Standard PWA Install Button (Android/Desktop) -->
  <Transition name="fade">
    <button
      v-if="showStandardPrompt"
      class="pwa-install-button"
      :class="{ 'dark-theme': prefersDark }"
      @click="installPWA"
      :aria-label="t('PWAInstall.installAriaLabel')"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>{{ t('PWAInstall.installButton') }}</span>
    </button>
  </Transition>
</template>

  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { t } from '../config/appText.js'

// ============================================================
// CONSTANTS & CONFIGURATION
// ============================================================

const STORAGE_KEY = 'pwaInstallHintDismissed'
const DISMISSAL_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
const BANNER_DELAY = 3000 // Show banner after 3 seconds

// ============================================================
// STATE
// ============================================================

const showBanner = ref(false)
const showStandardPrompt = ref(false)
const deferredPrompt = ref(null)

// ============================================================
// DEVICE & ENVIRONMENT DETECTION
// ============================================================

/**
 * Detect if device is iOS
 * Checks for iPhone, iPad, or iPod
 */
const isIOS = computed(() => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
})

/**
 * Detect if device is iPad specifically
 * Needed for different Share button position
 */
const isIPad = computed(() => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  // Modern iPads might report as Mac, check for touch support
  return /ipad/.test(userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
})

/**
 * Detect if running in Safari (not in-app browser)
 * Excludes Chrome, Firefox, Facebook, Instagram, etc.
 */
const isSafari = computed(() => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isChrome = /crios|chrome/.test(userAgent)
  const isFirefox = /fxios|firefox/.test(userAgent)
  const isInAppBrowser = /fbav|instagram|line|snapchat|twitter|whatsapp/.test(userAgent)
  const isSafariUA = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
  
  return isSafariUA && !isInAppBrowser && !isChrome && !isFirefox
})

/**
 * Check if app is already installed (running in standalone mode)
 * iOS: navigator.standalone
 * Other: display-mode: standalone
 */
const isStandalone = computed(() => {
  // iOS standalone mode
  if (window.navigator.standalone) {
    return true
  }
  
  // Other browsers - check display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }
  
  return false
})

/**
 * Check if user prefers dark mode
 */
const prefersDark = computed(() => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = computed(() => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

/**
 * Check if document direction is RTL
 */
const isRTL = computed(() => {
  return document.documentElement.dir === 'rtl' || 
         document.body.dir === 'rtl'
})

// ============================================================
// INSTALL INSTRUCTIONS
// ============================================================

/**
 * Get platform-specific install instructions
 */
const installInstructions = computed(() => {
  if (isIPad.value) {
    return t('PWAInstall.instructionsIPad')
  } else {
    return t('PWAInstall.instructionsIPhone')
  }
})

// ============================================================
// STORAGE MANAGEMENT
// ============================================================

/**
 * Check if install hint was previously dismissed
 * Returns true if dismissed within last 30 days
 */
const wasDismissed = () => {
  try {
    const dismissedData = localStorage.getItem(STORAGE_KEY)
    if (!dismissedData) return false
    
    const { timestamp } = JSON.parse(dismissedData)
    const now = Date.now()
    
    // Check if dismissal is still valid (within 30 days)
    return (now - timestamp) < DISMISSAL_DURATION
  } catch (error) {
    console.error('Error checking dismissal status:', error)
    return false
  }
}

/**
 * Mark install hint as dismissed
 * Stores timestamp for 30-day expiration
 */
const markAsDismissed = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      dismissed: true,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error('Error saving dismissal:', error)
  }
}

// ============================================================
// BANNER CONTROL
// ============================================================

/**
 * Dismiss the install banner
 * Marks as dismissed and hides banner
 */
const dismissBanner = () => {
  showBanner.value = false
  markAsDismissed()
}

/**
 * Show the install banner after delay
 * Only if conditions are met
 */
const showBannerWithDelay = () => {
  setTimeout(() => {
    if (shouldShowIOSBanner()) {
      showBanner.value = true
    }
  }, BANNER_DELAY)
}

/**
 * Check if iOS banner should be shown
 * All conditions must be true
 */
const shouldShowIOSBanner = () => {
  return (
    isIOS.value &&           // Is iOS device
    isSafari.value &&        // Is Safari browser (not in-app)
    !isStandalone.value &&   // Not already installed
    !wasDismissed()          // Not dismissed recently
  )
}

// ============================================================
// STANDARD PWA INSTALL (Android/Desktop)
// ============================================================

/**
 * Handle beforeinstallprompt event (non-iOS)
 * Stores the event for later use
 */
const handleBeforeInstallPrompt = (e) => {
  // Prevent Chrome's mini-infobar from appearing
  e.preventDefault()
  
  // Store the event for later use
  deferredPrompt.value = e
  
  // Show our custom install button
  if (!isIOS.value && !isStandalone.value) {
    showStandardPrompt.value = true
  }
}

/**
 * Trigger PWA install (Android/Desktop)
 * Uses stored beforeinstallprompt event
 */
const installPWA = async () => {
  if (!deferredPrompt.value) return
  
  // Show the install prompt
  deferredPrompt.value.prompt()
  
  // Wait for user choice
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    console.log('PWA installed successfully')
  }
  
  // Clear the deferred prompt
  deferredPrompt.value = null
  showStandardPrompt.value = false
}

/**
 * Handle app installation (all platforms)
 * Hides prompts when app is installed
 */
const handleAppInstalled = () => {
  console.log('PWA was installed')
  showBanner.value = false
  showStandardPrompt.value = false
  deferredPrompt.value = null
}

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  // Set up event listeners for standard PWA install (non-iOS)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  
  // Check if should show iOS banner
  if (shouldShowIOSBanner()) {
    showBannerWithDelay()
  }
  
  // Listen for display mode changes (app installed/uninstalled)
  const displayModeQuery = window.matchMedia('(display-mode: standalone)')
  displayModeQuery.addEventListener('change', (e) => {
    if (e.matches) {
      // App is now in standalone mode (installed)
      showBanner.value = false
      showStandardPrompt.value = false
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>

<style scoped>
/* ============================================================
   PWA INSTALL BANNER (iOS)
   ============================================================ */

.pwa-install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  padding: 16px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
}

.banner-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

/* Dark theme */
.pwa-install-banner.dark-theme {
  background: #1a1a1a;
  border-top-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* RTL support */
.pwa-install-banner.rtl {
  direction: rtl;
}

.pwa-install-banner.rtl .banner-content {
  flex-direction: row-reverse;
}

/* App icon */
.banner-icon {
  flex-shrink: 0;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Text content */
.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: #0e3a3a;
  letter-spacing: 0.3px;
}

.banner-description {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  color: #425e5e;
  line-height: 1.4;
}

.dark-theme .banner-title {
  color: #ffffff;
}

.dark-theme .banner-description {
  color: #b0b0b0;
}

/* Action button */
.action-btn {
  flex-shrink: 0;
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: #1a7a45;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: #146536;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn:focus-visible {
  outline: 2px solid #1a7a45;
  outline-offset: 2px;
}

/* ============================================================
   HINT ANIMATION (Pointing Arrow)
   ============================================================ */

.hint-animation {
  position: absolute;
  z-index: 1;
}

/* iPhone: Arrow points down (Share button at bottom) */
.hint-animation:not(.ipad-position) {
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
}

/* iPad: Arrow points up (Share button at top-right) */
.hint-animation.ipad-position {
  top: -60px;
  right: 20px;
}

.rtl .hint-animation.ipad-position {
  right: auto;
  left: 20px;
}

/* Pulse animation */
.pulse-arrow {
  animation: pulse 2s ease-in-out infinite;
  color: #1a7a45;
}

.pulse-arrow.arrow-down {
  animation: pulse-down 2s ease-in-out infinite;
}

.pulse-arrow.arrow-up {
  animation: pulse-up 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes pulse-down {
  0%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(8px);
  }
}

@keyframes pulse-up {
  0%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-8px);
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .pulse-arrow {
    animation: none;
  }
}

/* ============================================================
   STANDARD PWA INSTALL BUTTON (Android/Desktop)
   ============================================================ */

.pwa-install-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9997;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 999px;
  border: none;
  background: #1a7a45;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(26, 122, 69, 0.3);
  transition: background 0.2s ease, transform 0.1s ease;
}

.pwa-install-button:hover {
  background: #146536;
  box-shadow: 0 6px 16px rgba(26, 122, 69, 0.4);
}

.pwa-install-button:active {
  transform: scale(0.98);
}

.pwa-install-button:focus-visible {
  outline: 2px solid #1a7a45;
  outline-offset: 2px;
}

.pwa-install-button.dark-theme {
  background: #1a7a45;
  box-shadow: 0 4px 12px rgba(26, 122, 69, 0.5);
}

/* RTL positioning */
.rtl .pwa-install-button {
  right: auto;
  left: 20px;
}

/* ============================================================
   TRANSITIONS
   ============================================================ */

/* Slide up transition for iOS banner */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Fade transition for standard button */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active,
  .slide-up-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}

/* ============================================================
   RESPONSIVE DESIGN
   ============================================================ */

/* Mobile optimizations */
@media (max-width: 640px) {
  .pwa-install-banner {
    padding: 14px;
  }
  
  .banner-content {
    gap: 10px;
  }
  
  .app-icon {
    width: 40px;
    height: 40px;
  }
  
  .banner-title {
    font-size: 15px;
  }
  
  .banner-description {
    font-size: 12px;
  }
  
  .action-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .pwa-install-button {
    bottom: 16px;
    right: 16px;
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .rtl .pwa-install-button {
    right: auto;
    left: 16px;
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .pwa-install-banner {
    padding: 20px;
  }
  
  .banner-content {
    gap: 16px;
  }
}

/* Safe area insets for notched devices */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pwa-install-banner {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}

/* ============================================================
   ACCESSIBILITY
   ============================================================ */

/* Focus styles for keyboard navigation */
.action-btn:focus-visible,
.pwa-install-button:focus-visible {
  outline: 2px solid #1a7a45;
  outline-offset: 2px;
}

.dark-theme .action-btn:focus-visible,
.dark-theme .pwa-install-button:focus-visible {
  outline-color: #22c55e;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .pwa-install-banner {
    border-top-width: 2px;
  }
  
  .action-btn,
  .pwa-install-button {
    border: 2px solid currentColor;
  }
}
</style>

