/**
 * ============================================================
 * DEEGAAN RESTAURANT - APP TEXT CONFIGURATION
 * ============================================================
 * 
 * This file contains ALL user-facing text in the application.
 * Staff can edit this file to change any message without touching code.
 * 
 * INSTRUCTIONS FOR STAFF:
 * 1. Find the section you want to edit (Welcome, Menu, Checkout, etc.)
 * 2. Change the text between quotes
 * 3. Save the file
 * 4. Rebuild app: npm run build
 * 
 * IMPORTANT:
 * - Keep the quotes around text
 * - Don't change the property names (e.g., "title:" stays as is)
 * - Only change the text after the colon
 * 
 * ============================================================
 */

export const APP_TEXT = {
  
  // ============================================================
  // WELCOME SCREEN
  // ============================================================
  Welcome: {
    greeting: 'WELCOME TO',
    brandName: 'DEEGAAN RESTAURANT',
    subtitle: 'Authentic Somali & Indian Cuisine',
    continueButton: 'CONTINUE',
    continueButtonIcon: '➜',
  },

  // ============================================================
  // MENU SCREEN
  // ============================================================
  Menu: {
    title: 'MENU',
    backButton: 'Back',
    cartButton: 'Cart',
    allCategory: 'All',
    allCategoryEmoji: '🍲',
    filtersButton: 'Filters',
    
    // Empty state
    emptyStateIcon: '🔍',
    emptyStateTitle: 'No items found',
    emptyStateText: 'Try adjusting your filters or search terms',
    clearFiltersButton: 'Clear All Filters',
  },

  // ============================================================
  // MENU ITEM CARD
  // ============================================================
  MenuItem: {
    addButton: 'ADD',
    
    // Modal
    modalTitle: '', // Uses item name
    chooseSizeLabel: 'Choose Size',
    addOnsLabel: 'Add-ons',
    quantityLabel: 'Quantity',
    removeWarning: '⚠️ This item will be removed from your cart',
    
    // Buttons
    cancelButton: 'Cancel',
    confirmButton: 'Add to Cart',
  },

  // ============================================================
  // MEAL NOTES INPUT
  // ============================================================
  MealNotes: {
    label: 'Add note (e.g., No Onion, Less Salt…)',
    placeholder: 'Type to search or add a note...',
    addNewPrefix: '➕ Add "',
    addNewSuffix: '"',
  },

  // ============================================================
  // FILTER SHEET
  // ============================================================
  Filters: {
    title: 'Filter Menu',
    searchLabel: 'Search',
    searchPlaceholder: 'Search menu items...',
    categoriesLabel: 'Categories',
    priceRangeLabel: 'Price Range',
    priceRangeText: 'Selected: $0 – $',
    resetButton: 'RESET',
    applyButton: 'APPLY FILTERS',
  },

  // ============================================================
  // CHECKOUT / CART
  // ============================================================
  Checkout: {
    title: 'CHECKOUT',
    backButton: 'Back',
    brandName: 'Deegaan Restaurant',
    
    // Cart items
    quantityPrefix: 'x',
    sizePrefix: 'Size: ',
    notePrefix: 'Note: ',
    addonPrefix: '+ ',
    
    // Buttons in cart
    editNoteButton: '', // Icon only
    addNoteButton: '➕ Add note',
    removeButton: '', // Icon only
    
    // Empty state
    emptyCartText: 'Your cart is empty.',
    
    // Summary
    subtotalLabel: 'Subtotal:',
    taxLabel: 'Tax:',
    vatLabel: '', // Uses settings from API
    totalLabel: 'Total:',
    deliveryEstimate: 'Estimated delivery: 25–30 min',
    
    // Order button
    placeOrderButton: 'PLACE ORDER',
    placingOrderButton: 'PLACING ORDER...',
    
    // Loading overlay
    placingTitle: 'Placing Your Order...',
    placingMessage: 'Please wait while we process your order and create all necessary records.',
    
    // Success modal
    successTitle: 'Order Placed Successfully!',
    successOrderIdPrefix: 'Order ID: ',
    successMessage: 'Your order has been received and is being prepared.',
    backToMenuButton: 'Back to Menu',
    
    // Delete confirmation
    deleteTitle: 'Remove this item?',
    deleteMessage: 'Are you sure you want to remove it from your cart?',
    deleteCancelButton: 'Cancel',
    deleteConfirmButton: 'Delete',
    
    // Edit notes modal
    editNotesTitle: 'Edit Notes',
    editNotesCancelButton: 'Cancel',
    editNotesSaveButton: 'Save Notes',
  },

  // ============================================================
  // PWA INSTALL PROMPT
  // ============================================================
  PWAInstall: {
    title: 'Install Deegaan App',
    instructionsIPhone: 'Tap the Share button at the bottom, then select "Add to Home Screen"',
    instructionsIPad: 'Tap the Share button at the top-right, then select "Add to Home Screen"',
    dismissButton: 'Got it!',
    
    // Standard install button (Android/Desktop)
    installButton: 'Install App',
    installAriaLabel: 'Install app',
  },

  // ============================================================
  // OFFLINE INDICATOR
  // ============================================================
  Offline: {
    icon: '📡',
    message: "You're offline - showing cached data",
  },

  // ============================================================
  // TABLE INDICATOR
  // ============================================================
  Table: {
    prefix: 'Table: ',
    hideAriaLabel: 'Hide table indicator',
  },

  // ============================================================
  // LOADING SCREEN
  // ============================================================
  Loading: {
    text: 'Loading...',
  },

  // ============================================================
  // ALERTS & ERRORS
  // ============================================================
  Alerts: {
    scanTableFirst: 'Please scan a table QR code first',
    cartEmpty: 'Your cart is empty',
    orderFailed: 'Failed to place order: ',
  },

  // ============================================================
  // COMMON / SHARED
  // ============================================================
  Common: {
    currency: '$',
    quantityMultiplier: 'x',
    pricePrefix: '$',
  },

}

/**
 * ============================================================
 * HELPER FUNCTION TO GET TEXT
 * ============================================================
 * 
 * Usage in Vue components:
 * import { t } from '@/config/appText.js'
 * 
 * const text = t('Welcome.greeting')          // Returns: 'WELCOME TO'
 * const text = t('Menu.title')                // Returns: 'MENU'
 * const text = t('Checkout.placeOrderButton') // Returns: 'PLACE ORDER'
 * 
 * @param {string} path - Dot notation path to text (e.g., 'Welcome.greeting')
 * @returns {string} - The text value, or path if not found
 */
export function t(path) {
  const keys = path.split('.')
  let value = APP_TEXT
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      // Return path if not found (for debugging)
      console.warn(`Text not found for path: ${path}`)
      return path
    }
  }
  
  return value
}

/**
 * Export default for easier imports
 */
export default { APP_TEXT, t }

