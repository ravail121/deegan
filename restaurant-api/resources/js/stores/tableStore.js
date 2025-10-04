import { defineStore } from 'pinia'

export const useTableStore = defineStore('table', {
  state: () => ({
    tableName: null,
    tableID: null,
    whouseID: null,
    isTableDataLoaded: false,
    showTableIndicator: true
  }),

  getters: {
    getTableName: (state) => state.tableName,
    getTableID: (state) => state.tableID,
    getWhouseID: (state) => state.whouseID,
    hasTableData: (state) => state.tableName && state.tableID && state.whouseID,
    getTableDisplayName: (state) => state.tableName || 'No Table',
    getTableInfo: (state) => ({
      tableName: state.tableName,
      tableID: state.tableID,
      whouseID: state.whouseID
    }),
    shouldShowTableIndicator: (state) => state.hasTableData && state.showTableIndicator
  },

  actions: {
    // Set table data from QR code parameters
    setTableData(tableName, tableID, whouseID) {
      this.tableName = tableName
      this.tableID = tableID
      this.whouseID = whouseID
      this.isTableDataLoaded = true
      this.showTableIndicator = true // Show indicator when new table data is set
      
      // Save to localStorage for persistence
      this.saveToStorage()
      
    },

    // Save table data to localStorage
    saveToStorage() {
      const tableData = {
        tableName: this.tableName,
        tableID: this.tableID,
        whouseID: this.whouseID,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('deegan_table_data', JSON.stringify(tableData))
    },

    // Load table data from localStorage
    loadFromStorage() {
      try {
        const stored = localStorage.getItem('deegan_table_data')
        if (stored) {
          const tableData = JSON.parse(stored)
          this.tableName = tableData.tableName
          this.tableID = tableData.tableID
          this.whouseID = tableData.whouseID
          this.isTableDataLoaded = true
          return true
        }
      } catch (error) {
        console.error('Failed to load table data from storage:', error)
      }
      return false
    },

    // Hide table indicator (without clearing data)
    hideTableIndicator() {
      this.showTableIndicator = false
    },

    // Show table indicator
    showTableIndicatorPopup() {
      this.showTableIndicator = true
    },

    // Clear table data (completely remove)
    clearTableData() {
      this.tableName = null
      this.tableID = null
      this.whouseID = null
      this.isTableDataLoaded = false
      this.showTableIndicator = false
      localStorage.removeItem('deegan_table_data')
    },

    // Parse URL parameters and extract table data
    parseURLParameters() {
      const urlParams = new URLSearchParams(window.location.search)
      
      const tableName = urlParams.get('tableName')
      const tableID = urlParams.get('tableID')
      const whouseID = urlParams.get('whouseID')
      
      
      // If we have all required parameters, set the table data
      if (tableName && tableID && whouseID) {
        this.setTableData(tableName, tableID, whouseID)
        return true
      }
      
      return false
    },

    // Initialize table store - check URL params first, then localStorage
    initializeTableStore() {
      
      // First, try to get data from URL parameters (QR code scan)
      const hasURLData = this.parseURLParameters()
      
      // If no URL data, try to load from localStorage
      if (!hasURLData) {
        this.loadFromStorage()
      }
      
      // Clean up URL parameters after processing to avoid confusion
      if (hasURLData) {
        this.cleanupURL()
      }
      
    },

    // Clean up URL parameters after processing
    cleanupURL() {
      try {
        const url = new URL(window.location)
        url.searchParams.delete('tableName')
        url.searchParams.delete('tableID')
        url.searchParams.delete('whouseID')
        
        // Update URL without the parameters (without page reload)
        window.history.replaceState({}, document.title, url.pathname + url.search)
      } catch (error) {
        console.error('Failed to cleanup URL:', error)
      }
    },

    // Get table data for API calls
    getTableDataForAPI() {
      if (this.hasTableData) {
        return {
          table_name: this.tableName,
          table_id: this.tableID,
          warehouse_id: this.whouseID
        }
      }
      return null
    },

    // Check if table data is recent (within last 24 hours)
    isTableDataRecent() {
      try {
        const stored = localStorage.getItem('deegan_table_data')
        if (stored) {
          const tableData = JSON.parse(stored)
          const timestamp = new Date(tableData.timestamp)
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          return timestamp > twentyFourHoursAgo
        }
      } catch (error) {
        console.error('Failed to check table data timestamp:', error)
      }
      return false
    }
  }
})
