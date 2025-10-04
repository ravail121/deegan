// Utility functions for QR code handling

/**
 * Generate a QR code URL with table parameters
 * @param {string} baseUrl - Base URL of the application
 * @param {string} tableName - Name of the table
 * @param {string} tableID - ID of the table
 * @param {string} whouseID - Warehouse ID
 * @returns {string} Complete URL with QR parameters
 */
export function generateQRUrl(baseUrl, tableName, tableID, whouseID) {
  const url = new URL(baseUrl)
  url.searchParams.set('tableName', tableName)
  url.searchParams.set('tableID', tableID)
  url.searchParams.set('whouseID', whouseID)
  return url.toString()
}

/**
 * Parse QR parameters from a URL string
 * @param {string} urlString - URL string to parse
 * @returns {object|null} Object with QR parameters or null if not found
 */
export function parseQRUrl(urlString) {
  try {
    const url = new URL(urlString)
    const tableName = url.searchParams.get('tableName')
    const tableID = url.searchParams.get('tableID')
    const whouseID = url.searchParams.get('whouseID')
    
    if (tableName && tableID && whouseID) {
      return {
        tableName,
        tableID,
        whouseID
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to parse QR URL:', error)
    return null
  }
}

/**
 * Validate QR parameters
 * @param {object} qrData - QR data object
 * @returns {boolean} True if valid
 */
export function validateQRData(qrData) {
  return qrData && 
         qrData.tableName && 
         qrData.tableID && 
         qrData.whouseID &&
         typeof qrData.tableName === 'string' &&
         typeof qrData.tableID === 'string' &&
         typeof qrData.whouseID === 'string'
}

/**
 * Format QR data for display
 * @param {object} qrData - QR data object
 * @returns {string} Formatted string
 */
export function formatQRData(qrData) {
  if (!validateQRData(qrData)) {
    return 'Invalid QR data'
  }
  
  return `Table: ${qrData.tableName} (ID: ${qrData.tableID}, Warehouse: ${qrData.whouseID})`
}

/**
 * Create a test QR URL for development
 * @param {string} baseUrl - Base URL of the application
 * @returns {string} Test QR URL
 */
export function createTestQRUrl(baseUrl = window.location.origin) {
  return generateQRUrl(baseUrl, 'Table 5', '123', '456')
}
