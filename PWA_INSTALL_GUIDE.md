# 📱 iOS PWA Install Guidance - Complete Implementation

## 🎯 Overview

A comprehensive PWA installation prompt system with intelligent iOS detection and platform-specific guidance. Shows custom banners for iOS devices (since Safari doesn't support standard install prompts) and uses the standard `beforeinstallprompt` flow for Android/Desktop.

---

## ✨ Features Implemented

### ✅ iOS Detection & Guidance
- **Smart Detection:** Identifies iPhone vs iPad vs other devices
- **Safari-Only:** Shows only in Safari, not in-app browsers (Facebook, Instagram, etc.)
- **Platform-Specific Instructions:**
  - iPhone: "Tap Share button at the bottom..."
  - iPad: "Tap Share button at the top-right..."
- **Animated Hints:** Pulsing arrow pointing to Share button location
- **Reduced Motion:** Respects `prefers-reduced-motion` setting

### ✅ Standard PWA (Android/Desktop)
- **beforeinstallprompt:** Uses native Chrome/Edge install flow
- **Custom Button:** Floating "Install App" button
- **Auto-Hide:** Disappears after installation

### ✅ Smart Behavior
- **Delay:** Shows after 3 seconds (not immediately)
- **Dismissal Memory:** Remembers dismissal for 30 days
- **Install Detection:** Never shows if already installed
- **Standalone Check:** Monitors display mode changes

### ✅ Accessibility
- **Focus Management:** Focus trap on banner
- **Keyboard Support:** ESC to dismiss
- **ARIA Labels:** Proper semantic markup
- **Screen Reader:** Descriptive labels
- **High Contrast:** Respects `prefers-contrast`

### ✅ Design & Themes
- **Light/Dark:** Auto-adapts to system preference
- **RTL Support:** Right-to-left language support
- **Responsive:** Works on all screen sizes
- **Safe Areas:** Respects iPhone notch areas

---

## 🔍 Detection Logic

### iOS Device Detection

```javascript
/**
 * Detects if device is iOS (iPhone, iPad, iPod)
 * Checks user agent for iOS identifiers
 */
const isIOS = computed(() => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
})
```

### iPad-Specific Detection

```javascript
/**
 * Detects iPad specifically
 * Needed for different Share button position
 * Note: Modern iPads may report as Mac with touch support
 */
const isIPad = computed(() => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /ipad/.test(userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
})
```

### Safari Browser Detection

```javascript
/**
 * Detects Safari browser (excludes in-app browsers)
 * Returns false for:
 * - Chrome (CriOS)
 * - Firefox (FxiOS)
 * - Facebook in-app
 * - Instagram in-app
 * - Twitter, WhatsApp, Snapchat, etc.
 */
const isSafari = computed(() => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isChrome = /crios|chrome/.test(userAgent)
  const isFirefox = /fxios|firefox/.test(userAgent)
  const isInAppBrowser = /fbav|instagram|line|snapchat|twitter|whatsapp/.test(userAgent)
  const isSafariUA = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
  
  return isSafariUA && !isInAppBrowser && !isChrome && !isFirefox
})
```

### Standalone Mode Detection

```javascript
/**
 * Checks if app is already installed
 * iOS: navigator.standalone === true
 * Others: display-mode: standalone
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
```

### Show Banner Decision

```javascript
/**
 * All conditions must be true:
 * 1. iOS device
 * 2. Safari browser (not in-app)
 * 3. Not already installed
 * 4. Not dismissed in last 30 days
 */
const shouldShowIOSBanner = () => {
  return (
    isIOS.value &&
    isSafari.value &&
    !isStandalone.value &&
    !wasDismissed()
  )
}
```

---

## 💾 Storage Management

### Dismissal Storage

**Storage Key:** `pwaInstallHintDismissed`

**Storage Format:**
```json
{
  "dismissed": true,
  "timestamp": 1696752000000
}
```

**Expiration:** 30 days (2,592,000,000 milliseconds)

### How It Works

```javascript
// When user dismisses banner
markAsDismissed() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    dismissed: true,
    timestamp: Date.now()
  }))
}

// Check if dismissed
wasDismissed() {
  const data = localStorage.getItem(STORAGE_KEY)
  const { timestamp } = JSON.parse(data)
  const now = Date.now()
  
  // Valid if dismissed within last 30 days
  return (now - timestamp) < DISMISSAL_DURATION
}
```

### Reset Dismissal

To reset for testing:
```javascript
// In browser console
localStorage.removeItem('pwaInstallHintDismissed')
```

---

## 🎨 Visual Design

### iOS Banner (Bottom of Screen)

```
┌────────────────────────────────────────┐
│                                      ✕ │
│  📱  Install Deegaan App                │
│      Tap the Share button at the       │
│      bottom, then select "Add to       │
│      Home Screen"                       │
│                                         │
│                         [GOT IT!]       │
│         ↓ (pulsing)                    │ ← Animated arrow
└────────────────────────────────────────┘
```

### Standard Button (Android/Desktop)

```
                        ┌──────────────┐
                        │ ⬇ Install App│ ← Floating button
                        └──────────────┘
                        (bottom-right)
```

---

## 🎭 Animations & Visual Hints

### Pulsing Arrow

**iPhone (Share at bottom):**
```css
@keyframes pulse-down {
  0%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(8px);  /* Bounce down */
  }
}
```

**iPad (Share at top-right):**
```css
@keyframes pulse-up {
  0%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-8px);  /* Bounce up */
  }
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .pulse-arrow {
    animation: none;  /* No animation */
  }
}
```

---

## 🎨 Theme Support

### Light Theme (Default)
```css
Background: #ffffff
Text: #0e3a3a
Border: rgba(0, 0, 0, 0.1)
Button: #1a7a45
```

### Dark Theme (Auto-Detect)
```css
Background: #1a1a1a
Text: #ffffff
Border: rgba(255, 255, 255, 0.1)
Button: #1a7a45
```

**Detection:**
```javascript
const prefersDark = computed(() => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})
```

**Usage:**
```vue
<div class="banner" :class="{ 'dark-theme': prefersDark }">
```

---

## 🌍 RTL (Right-to-Left) Support

### Detection
```javascript
const isRTL = computed(() => {
  return document.documentElement.dir === 'rtl' || 
         document.body.dir === 'rtl'
})
```

### Styling
```css
.pwa-install-banner.rtl {
  direction: rtl;
}

/* Flip close button position */
.rtl .close-btn {
  right: auto;
  left: -8px;
}

/* Flip hint position for iPad */
.rtl .hint-animation.ipad-position {
  right: auto;
  left: 20px;
}
```

---

## 🖼️ Custom Artwork & Animations

### Option 1: SVG Arrows (Current Implementation)
Uses built-in SVG arrows with pulse animation.

**Pros:**
- No external files needed
- Lightweight
- Scalable
- Works immediately

### Option 2: Custom GIF/Images

Create custom hint animations and place them:

**Directory Structure:**
```
public/
  assets/
    pwa/
      hint-iphone-light.gif      # iPhone light mode
      hint-iphone-dark.gif       # iPhone dark mode
      hint-ipad-light.gif        # iPad light mode
      hint-ipad-dark.gif         # iPad dark mode
      hint-hand-pointing.gif     # Generic pointing hand
```

**Update Component:**
```vue
<!-- Replace pulse-arrow div with: -->
<img 
  :src="getHintImage()" 
  alt="" 
  class="hint-image"
  aria-hidden="true"
/>
```

**Add method:**
```javascript
const getHintImage = () => {
  const theme = prefersDark.value ? 'dark' : 'light'
  const device = isIPad.value ? 'ipad' : 'iphone'
  return `/assets/pwa/hint-${device}-${theme}.gif`
}
```

### Option 3: Lottie Animations

**Install Lottie:**
```bash
npm install lottie-web
```

**Place animations:**
```
public/
  assets/
    pwa/
      tap-share-iphone.json    # Lottie animation
      tap-share-ipad.json      # Lottie animation
```

**Update component:**
```vue
<script setup>
import lottie from 'lottie-web'

onMounted(() => {
  const animData = isIPad.value 
    ? '/assets/pwa/tap-share-ipad.json'
    : '/assets/pwa/tap-share-iphone.json'
    
  lottie.loadAnimation({
    container: hintContainer.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animData
  })
})
</script>
```

---

## ⚙️ Configuration Options

### Timing

```javascript
// Show banner after 3 seconds
const BANNER_DELAY = 3000

// Change to show immediately:
const BANNER_DELAY = 0

// Change to show after 10 seconds:
const BANNER_DELAY = 10000
```

### Dismissal Duration

```javascript
// Remember dismissal for 30 days
const DISMISSAL_DURATION = 30 * 24 * 60 * 60 * 1000

// Change to 7 days:
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000

// Change to 1 day:
const DISMISSAL_DURATION = 24 * 60 * 60 * 1000

// Never ask again (1 year):
const DISMISSAL_DURATION = 365 * 24 * 60 * 60 * 1000
```

### Install Instructions Text

```javascript
// Customize wording
const installInstructions = computed(() => {
  if (isIPad.value) {
    return 'Install for quick access: Tap ⎙ (top-right) → Add to Home Screen'
  } else {
    return 'Install for offline access: Tap ⎙ (bottom) → Add to Home Screen'
  }
})
```

### Banner Position

```css
/* Default: Bottom */
.pwa-install-banner {
  bottom: 0;
  top: auto;
}

/* Change to Top: */
.pwa-install-banner {
  top: 0;
  bottom: auto;
  border-top: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
```

---

## 🧪 Testing Guide

### Test on iPhone

1. **Open Safari on iPhone**
2. **Navigate to your app**
3. **Wait 3 seconds**
4. **Banner should appear at bottom**
5. **Arrow should pulse downward** (pointing to Share button)
6. **Tap "Got it!" or ✕**
7. **Banner dismisses**
8. **Refresh page** → Banner should NOT appear (30 day cooldown)

**Reset test:**
```javascript
// In Safari console
localStorage.removeItem('pwaInstallHintDismissed')
// Refresh page
```

### Test on iPad

1. **Open Safari on iPad**
2. **Navigate to your app**
3. **Wait 3 seconds**
4. **Banner should appear at bottom**
5. **Arrow should pulse upward at top-right** (pointing to Share button)
6. **Instructions should say "top-right"**

### Test In-App Browser

1. **Open link in Facebook app**
2. **Navigate to your app**
3. **Banner should NOT appear** ✅
4. **Same for Instagram, WhatsApp, etc.**

### Test Standalone Mode

1. **Install app to home screen**
2. **Open app from home screen**
3. **Banner should NOT appear** ✅

### Test Android/Desktop

1. **Open Chrome on Android**
2. **Navigate to your app**
3. **Wait 3 seconds**
4. **Floating "Install App" button appears (bottom-right)**
5. **Click button**
6. **Native install prompt appears**
7. **Install or dismiss**

### Test Dark Mode

1. **Enable dark mode on device**
2. **Open app**
3. **Banner should have dark background**
4. **Text should be white**

### Test Reduced Motion

1. **Enable "Reduce Motion" in iOS Settings**
   - Settings → Accessibility → Motion → Reduce Motion
2. **Open app**
3. **Arrow should be static (no animation)**

### Test RTL (Arabic/Hebrew)

1. **Set document direction to RTL:**
   ```html
   <html dir="rtl">
   ```
2. **Banner layout should flip**
3. **Close button on left**
4. **Arrow on left for iPad**

---

## 📊 Detection Flow Chart

```
User opens app
    ↓
Wait 3 seconds
    ↓
Is iOS? ─── NO ──→ beforeinstallprompt? ─── YES ──→ Show Install Button
    │                       │
   YES                     NO
    ↓                       ↓
Is Safari? ─── NO ──→ Don't show (in-app browser)
    │
   YES
    ↓
Is Standalone? ─── YES ──→ Don't show (already installed)
    │
    NO
    ↓
Was dismissed? ─── YES ──→ Don't show (within 30 days)
    │
    NO
    ↓
Show iOS Banner with platform-specific instructions
```

---

## 🎨 Customization Guide

### Change Banner Colors

```css
/* Light theme */
.pwa-install-banner {
  background: #ffffff;      /* Your brand color */
  border-top: 1px solid #e0e0e0;
}

.banner-title {
  color: #0e3a3a;          /* Your primary color */
}

.action-btn {
  background: #1a7a45;     /* Your accent color */
}

/* Dark theme */
.dark-theme {
  background: #1a1a1a;     /* Your dark background */
}

.dark-theme .banner-title {
  color: #ffffff;          /* Your dark text color */
}
```

### Change App Icon

```vue
<!-- Current: -->
<img src="/icon-192.png" alt="..." />

<!-- Custom: -->
<img src="/your-custom-icon.png" alt="..." />
```

### Change Animation Speed

```css
/* Default: 2s pulse */
.pulse-arrow {
  animation: pulse 2s ease-in-out infinite;
}

/* Faster: 1s */
.pulse-arrow {
  animation: pulse 1s ease-in-out infinite;
}

/* Slower: 3s */
.pulse-arrow {
  animation: pulse 3s ease-in-out infinite;
}
```

### Change Banner Position

```css
/* Current: Bottom */
.pwa-install-banner {
  bottom: 0;
}

/* Change to top: */
.pwa-install-banner {
  top: 0;
  bottom: auto;
  border-top: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
```

---

## 🎯 Advanced Customization

### Add Custom Artwork

**1. Create animations:**
- Use After Effects or similar tool
- Export as GIF or Lottie JSON
- Size: 200×200px recommended
- Include pointing gesture

**2. Place files:**
```
public/assets/pwa/
  ├── hint-iphone.gif         # iPhone animation
  ├── hint-ipad.gif           # iPad animation
  ├── hint-hand.svg           # Static hand icon
  └── lottie/
      ├── tap-share-iphone.json
      └── tap-share-ipad.json
```

**3. Update component:**
```vue
<div class="hint-animation">
  <img 
    v-if="!prefersReducedMotion"
    :src="isIPad ? '/assets/pwa/hint-ipad.gif' : '/assets/pwa/hint-iphone.gif'"
    alt=""
    class="hint-image"
    aria-hidden="true"
  />
</div>
```

**4. Style the image:**
```css
.hint-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
}
```

### Add Sound Effect

```javascript
const playHintSound = () => {
  if (!prefersReducedMotion.value) {
    const audio = new Audio('/assets/pwa/hint.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {})
  }
}

// Call when showing banner
const showBannerWithDelay = () => {
  setTimeout(() => {
    if (shouldShowIOSBanner()) {
      showBanner.value = true
      playHintSound()  // ← Add sound
    }
  }, BANNER_DELAY)
}
```

### Add Haptic Feedback (iOS)

```javascript
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50) // 50ms vibration
  }
}

// Call when showing banner
showBanner.value = true
triggerHaptic()
```

---

## 📱 Platform-Specific Instructions

### iPhone Instructions

**English:**
```
"Tap the Share button at the bottom, then select 'Add to Home Screen'"
```

**Spanish:**
```
"Toca el botón Compartir en la parte inferior, luego selecciona 'Añadir a pantalla de inicio'"
```

**French:**
```
"Appuyez sur le bouton Partager en bas, puis sélectionnez 'Sur l'écran d'accueil'"
```

### iPad Instructions

**English:**
```
"Tap the Share button at the top-right, then select 'Add to Home Screen'"
```

**Arabic (RTL):**
```
"اضغط على زر المشاركة في الأعلى يمين، ثم اختر 'أضف إلى الشاشة الرئيسية'"
```

### i18n Integration

```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const installInstructions = computed(() => {
  if (isIPad.value) {
    return t('pwa.install.ipad')
  } else {
    return t('pwa.install.iphone')
  }
})
```

**Translation file:**
```json
{
  "pwa": {
    "install": {
      "iphone": "Tap the Share button at the bottom, then select 'Add to Home Screen'",
      "ipad": "Tap the Share button at the top-right, then select 'Add to Home Screen'",
      "title": "Install Deegaan App",
      "action": "Got it!"
    }
  }
}
```

---

## 🔧 Configuration Reference

### All Configurable Constants

```javascript
// Timing
const BANNER_DELAY = 3000              // 3 seconds
const DISMISSAL_DURATION = 30 * 24 * 60 * 60 * 1000  // 30 days

// Storage
const STORAGE_KEY = 'pwaInstallHintDismissed'

// Animation
const ANIMATION_DURATION = '2s'        // Pulse speed
const ANIMATION_EASING = 'ease-in-out' // Animation curve

// Positioning
const BANNER_POSITION = 'bottom'       // 'top' or 'bottom'
const BUTTON_POSITION = 'bottom-right' // For standard prompt
```

### Environment Variables (Optional)

```javascript
// .env
VITE_PWA_BANNER_DELAY=3000
VITE_PWA_DISMISSAL_DAYS=30
VITE_PWA_ENABLE_SOUND=false
```

**Usage:**
```javascript
const BANNER_DELAY = import.meta.env.VITE_PWA_BANNER_DELAY || 3000
```

---

## 🎯 User Scenarios

### Scenario 1: First-Time iPhone User

```
1. Opens app in Safari
   ↓
2. App loads, shows loading screen
   ↓
3. After 3 seconds, banner slides up from bottom
   ↓
4. Sees: "Tap Share button at the bottom..."
   ↓
5. Sees pulsing ↓ arrow
   ↓
6. Follows instructions, installs app
   ↓
7. Opens from home screen
   ↓
8. Banner never shows again (installed)
```

### Scenario 2: User Dismisses Banner

```
1. Banner appears
   ↓
2. User clicks "Got it!" or ✕
   ↓
3. Banner disappears
   ↓
4. Dismissal saved to localStorage
   ↓
5. User refreshes page
   ↓
6. Banner does NOT appear
   ↓
7. After 30 days, banner can show again
```

### Scenario 3: Android User

```
1. Opens app in Chrome
   ↓
2. App detects beforeinstallprompt
   ↓
3. Shows floating "Install App" button
   ↓
4. User clicks button
   ↓
5. Native Chrome install prompt appears
   ↓
6. User installs
   ↓
7. Button disappears
```

### Scenario 4: Facebook In-App Browser

```
1. User clicks link in Facebook
   ↓
2. Opens in Facebook's in-app browser
   ↓
3. Component detects in-app browser
   ↓
4. Banner does NOT show (can't install from in-app)
```

---

## ♿ Accessibility Features

### ARIA Attributes
```vue
<div 
  role="dialog"
  aria-labelledby="pwa-install-title"
  aria-describedby="pwa-install-description"
>
  <h3 id="pwa-install-title">Install App</h3>
  <p id="pwa-install-description">Instructions...</p>
</div>
```

### Focus Management
```javascript
// Focus close button when banner appears
nextTick(() => {
  closeButton.value?.focus()
})
```

### Keyboard Support
```vue
@keydown.esc="dismissBanner"
```

### Screen Reader Support
```vue
<button aria-label="Dismiss install prompt">
<div aria-hidden="true">  <!-- Decorative elements -->
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .pwa-install-banner {
    border-top-width: 2px;
  }
  
  .action-btn {
    border: 2px solid currentColor;
  }
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile (< 640px) */
@media (max-width: 640px) {
  .banner-title { font-size: 15px; }
  .banner-description { font-size: 12px; }
  .action-btn { padding: 8px 16px; }
}

/* Tablet (640px - 1024px) */
@media (min-width: 640px) and (max-width: 1024px) {
  .banner-content { gap: 14px; }
}

/* Desktop (> 1024px) */
@media (min-width: 1025px) {
  .banner-content {
    max-width: 800px;
    gap: 20px;
  }
}
```

---

## 🔍 Browser Support

| Browser | Support | Method |
|---------|---------|--------|
| **Safari (iOS)** | ✅ Custom banner | Manual detection |
| **Chrome (Android)** | ✅ Native prompt | beforeinstallprompt |
| **Edge (Desktop)** | ✅ Native prompt | beforeinstallprompt |
| **Firefox (Android)** | ✅ Native prompt | beforeinstallprompt |
| **Samsung Internet** | ✅ Native prompt | beforeinstallprompt |
| **Chrome (iOS)** | ❌ No prompt | Can't install from Chrome iOS |
| **In-app browsers** | ❌ No prompt | Can't install from in-app |

---

## 🐛 Troubleshooting

### Issue: Banner not showing on iOS

**Check:**
1. Is it actually Safari? (Not Chrome or in-app browser)
2. Is it already installed? (Check navigator.standalone)
3. Was it dismissed? (Check localStorage)
4. Wait 3 seconds after page load
5. Check console for errors

**Debug:**
```javascript
// Add to component
console.log('iOS:', isIOS.value)
console.log('Safari:', isSafari.value)
console.log('Standalone:', isStandalone.value)
console.log('Dismissed:', wasDismissed())
console.log('Should show:', shouldShowIOSBanner())
```

### Issue: Wrong device detected

**Check:**
```javascript
// In Safari console
navigator.userAgent
navigator.platform
navigator.maxTouchPoints
```

### Issue: Banner shows in Facebook app

**Verify detection:**
```javascript
// Should detect in-app browser
const isInAppBrowser = /fbav|instagram|line|snapchat|twitter|whatsapp/.test(userAgent)
```

### Issue: Dismissal not persisting

**Check localStorage:**
```javascript
// In console
localStorage.getItem('pwaInstallHintDismissed')
```

**Clear and test:**
```javascript
localStorage.removeItem('pwaInstallHintDismissed')
```

---

## 🎨 Design Tokens

For easy theming, extract to CSS variables:

```css
:root {
  /* PWA Banner Colors */
  --pwa-bg-light: #ffffff;
  --pwa-bg-dark: #1a1a1a;
  --pwa-text-light: #0e3a3a;
  --pwa-text-dark: #ffffff;
  --pwa-accent: #1a7a45;
  --pwa-border-light: rgba(0, 0, 0, 0.1);
  --pwa-border-dark: rgba(255, 255, 255, 0.1);
  
  /* Timing */
  --pwa-animation-duration: 2s;
  --pwa-transition-speed: 0.3s;
}

/* Usage */
.pwa-install-banner {
  background: var(--pwa-bg-light);
  border-top: 1px solid var(--pwa-border-light);
}
```

---

## 📈 Analytics Integration

### Track Banner Events

```javascript
// When banner shows
const showBannerWithDelay = () => {
  setTimeout(() => {
    if (shouldShowIOSBanner()) {
      showBanner.value = true
      
      // Track analytics
      if (window.gtag) {
        gtag('event', 'pwa_banner_shown', {
          device: isIPad.value ? 'ipad' : 'iphone',
          theme: prefersDark.value ? 'dark' : 'light'
        })
      }
    }
  }, BANNER_DELAY)
}

// When banner dismissed
const dismissBanner = () => {
  showBanner.value = false
  markAsDismissed()
  
  // Track analytics
  if (window.gtag) {
    gtag('event', 'pwa_banner_dismissed', {
      device: isIPad.value ? 'ipad' : 'iphone'
    })
  }
}

// When app installed
const handleAppInstalled = () => {
  // Track analytics
  if (window.gtag) {
    gtag('event', 'pwa_installed', {
      method: 'manual'
    })
  }
}
```

---

## 🚀 Performance Considerations

### Lazy Loading

```vue
<!-- Only load on certain routes -->
<PWAInstallPrompt v-if="showOnThisRoute" />
```

### Code Splitting

```javascript
// Lazy load component
const PWAInstallPrompt = defineAsyncComponent(() =>
  import('./components/PWAInstallPrompt.vue')
)
```

### Image Optimization

```html
<!-- Use WebP for better performance -->
<img src="/assets/pwa/hint.webp" alt="" />

<!-- With fallback -->
<picture>
  <source srcset="/assets/pwa/hint.webp" type="image/webp">
  <img src="/assets/pwa/hint.png" alt="">
</picture>
```

---

## 📋 Checklist

Before deploying:

- [ ] Component integrated in App.vue
- [ ] Tested on iPhone Safari
- [ ] Tested on iPad Safari
- [ ] Tested in Facebook in-app browser
- [ ] Tested on Android Chrome
- [ ] Verified dismissal works
- [ ] Verified 30-day expiration
- [ ] Tested dark mode
- [ ] Tested reduced motion
- [ ] Tested RTL (if applicable)
- [ ] Tested keyboard navigation
- [ ] Tested screen reader
- [ ] Analytics integrated (optional)
- [ ] Custom artwork added (optional)
- [ ] Instructions translated (if i18n)

---

## 🎉 Summary

You now have a complete PWA install guidance system with:

✅ **iOS-Specific:** Custom banner with platform-specific instructions
✅ **Smart Detection:** iPhone vs iPad, Safari vs in-app browsers
✅ **Visual Hints:** Animated arrows pointing to Share button
✅ **Dismissal Memory:** Remembers for 30 days
✅ **Install Detection:** Never shows if already installed
✅ **Standard PWA:** beforeinstallprompt for Android/Desktop
✅ **Accessibility:** Full keyboard, screen reader, reduced motion support
✅ **Themes:** Auto light/dark mode
✅ **RTL Support:** Right-to-left languages
✅ **Responsive:** Works on all screen sizes

**Everything is production-ready!** 🚀

---

## 📞 Support

**Common Questions:**

Q: Can I change the 3-second delay?
A: Yes, change `BANNER_DELAY = 3000` to your preferred milliseconds

Q: Can I show banner immediately?
A: Yes, set `BANNER_DELAY = 0`

Q: Can I use custom animations?
A: Yes, see "Custom Artwork" section above

Q: Will it work offline?
A: Yes, component is part of app bundle

Q: Can I force-show for testing?
A: Yes, remove localStorage item and refresh

**Need help?** Check the troubleshooting section above!

