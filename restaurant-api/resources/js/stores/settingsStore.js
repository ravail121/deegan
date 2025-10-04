import { defineStore } from 'pinia'
import axios from 'axios'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    vatPercentage: '0',
    financialYear: null,
    isLoading: false,
    lastFetched: null
  }),

  getters: {
    getVATPercentage: (state) => state.vatPercentage,
    getFinancialYear: (state) => state.financialYear,
    isVATEnabled: (state) => parseFloat(state.vatPercentage) > 0,
    getVATDisplayText: (state) => `${state.vatPercentage}% VAT`,
    
    // Calculate VAT amount for a given price
    calculateVAT: (state) => (price) => {
      const vatRate = parseFloat(state.vatPercentage) / 100
      return price * vatRate
    },
    
    // Calculate total with VAT
    calculateTotalWithVAT: (state) => (price) => {
      const vatAmount = state.calculateVAT(price)
      return price + vatAmount
    }
  },

  actions: {
    // Fetch system settings from API
    async fetchSettings() {
      this.isLoading = true
      try {
        const response = await axios.get('/api/settings/app')
        
        if (response.data.success) {
          this.vatPercentage = response.data.data.vat_percentage || '0'
          this.financialYear = response.data.data.financial_year
          this.lastFetched = new Date().toISOString()
          
          // Store in sessionStorage for persistence
          this.saveToSession()
        }
      } catch (error) {
        console.error('Failed to fetch system settings:', error)
        // Use default values if API fails
        this.vatPercentage = '0'
        this.financialYear = null
      } finally {
        this.isLoading = false
      }
    },

    // Fetch only VAT percentage
    async fetchVATPercentage() {
      try {
        const response = await axios.get('/api/settings/vat')
        
        if (response.data.success) {
          this.vatPercentage = response.data.data.vat_percentage || '0'
          this.lastFetched = new Date().toISOString()
          this.saveToSession()
        }
      } catch (error) {
        console.error('Failed to fetch VAT percentage:', error)
        this.vatPercentage = '0'
      }
    },

    // Save settings to sessionStorage
    saveToSession() {
      const settings = {
        vatPercentage: this.vatPercentage,
        financialYear: this.financialYear,
        lastFetched: this.lastFetched
      }
      sessionStorage.setItem('deegan_system_settings', JSON.stringify(settings))
    },

    // Load settings from sessionStorage
    loadFromSession() {
      try {
        const stored = sessionStorage.getItem('deegan_system_settings')
        if (stored) {
          const settings = JSON.parse(stored)
          this.vatPercentage = settings.vatPercentage || '0'
          this.financialYear = settings.financialYear
          this.lastFetched = settings.lastFetched
          return true
        }
      } catch (error) {
        console.error('Failed to load settings from session:', error)
      }
      return false
    },

    // Check if settings are stale (older than 1 hour)
    isStale() {
      if (!this.lastFetched) return true
      const lastFetchedTime = new Date(this.lastFetched)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return lastFetchedTime < oneHourAgo
    },

    // Initialize settings (load from session first, then fetch if stale)
    async initializeSettings() {
      // Try to load from session first
      const loadedFromSession = this.loadFromSession()
      
      // If no session data or data is stale, fetch from API
      if (!loadedFromSession || this.isStale()) {
        await this.fetchSettings()
      }
    },

    // Update VAT percentage (for testing or admin use)
    setVATPercentage(percentage) {
      this.vatPercentage = percentage.toString()
      this.saveToSession()
    },

    // Clear all settings
    clearSettings() {
      this.vatPercentage = '0'
      this.financialYear = null
      this.lastFetched = null
      sessionStorage.removeItem('deegan_system_settings')
    }
  }
})
