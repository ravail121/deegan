// IndexedDB storage for offline data persistence
const DB_NAME = 'DeegaanRestaurantDB'
const DB_VERSION = 1
const STORE_NAMES = {
  PACKAGES: 'packages',
  ITEMS: 'items',
  CACHE_META: 'cache_meta'
}

class IndexedDBStorage {
  constructor() {
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB opened successfully')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create packages store
        if (!db.objectStoreNames.contains(STORE_NAMES.PACKAGES)) {
          const packagesStore = db.createObjectStore(STORE_NAMES.PACKAGES, { keyPath: 'packageID' })
          packagesStore.createIndex('name', 'packageName', { unique: false })
        }

        // Create items store
        if (!db.objectStoreNames.contains(STORE_NAMES.ITEMS)) {
          const itemsStore = db.createObjectStore(STORE_NAMES.ITEMS, { keyPath: 'itemID' })
          itemsStore.createIndex('packageID', 'packageID', { unique: false })
          itemsStore.createIndex('name', 'itemName', { unique: false })
        }

        // Create cache metadata store
        if (!db.objectStoreNames.contains(STORE_NAMES.CACHE_META)) {
          db.createObjectStore(STORE_NAMES.CACHE_META, { keyPath: 'key' })
        }

        console.log('IndexedDB stores created')
      }
    })
  }

  async storePackages(packages) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAMES.PACKAGES], 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.PACKAGES)
      
      // Clear existing data
      store.clear()
      
      // Add new data
      packages.forEach(pkg => {
        store.add(pkg)
      })
      
      // Update cache metadata
      this.updateCacheMeta('packages', new Date().toISOString())
      
      transaction.oncomplete = () => {
        console.log('Packages stored in IndexedDB')
        resolve()
      }
      
      transaction.onerror = () => {
        console.error('Failed to store packages:', transaction.error)
        reject(transaction.error)
      }
    })
  }

  async storeItems(items) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAMES.ITEMS], 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.ITEMS)
      
      // Clear existing data
      store.clear()
      
      // Add new data
      items.forEach(item => {
        store.add(item)
      })
      
      // Update cache metadata
      this.updateCacheMeta('items', new Date().toISOString())
      
      transaction.oncomplete = () => {
        console.log('Items stored in IndexedDB')
        resolve()
      }
      
      transaction.onerror = () => {
        console.error('Failed to store items:', transaction.error)
        reject(transaction.error)
      }
    })
  }

  async getPackages() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAMES.PACKAGES], 'readonly')
      const store = transaction.objectStore(STORE_NAMES.PACKAGES)
      const request = store.getAll()
      
      request.onsuccess = () => {
        console.log('Packages retrieved from IndexedDB:', request.result.length)
        resolve(request.result)
      }
      
      request.onerror = () => {
        console.error('Failed to get packages:', request.error)
        reject(request.error)
      }
    })
  }

  async getItems() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAMES.ITEMS], 'readonly')
      const store = transaction.objectStore(STORE_NAMES.ITEMS)
      const request = store.getAll()
      
      request.onsuccess = () => {
        console.log('Items retrieved from IndexedDB:', request.result.length)
        resolve(request.result)
      }
      
      request.onerror = () => {
        console.error('Failed to get items:', request.error)
        reject(request.error)
      }
    })
  }

  async getItemsByPackage(packageId) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAMES.ITEMS], 'readonly')
      const store = transaction.objectStore(STORE_NAMES.ITEMS)
      const index = store.index('packageID')
      const request = index.getAll(packageId)
      
      request.onsuccess = () => {
        resolve(request.result)
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async updateCacheMeta(key, timestamp) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAMES.CACHE_META], 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.CACHE_META)
      const request = store.put({ key, timestamp })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCacheMeta(key) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAMES.CACHE_META], 'readonly')
      const store = transaction.objectStore(STORE_NAMES.CACHE_META)
      const request = store.get(key)
      
      request.onsuccess = () => {
        resolve(request.result ? request.result.timestamp : null)
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async clearAll() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([
        STORE_NAMES.PACKAGES, 
        STORE_NAMES.ITEMS, 
        STORE_NAMES.CACHE_META
      ], 'readwrite')
      
      transaction.objectStore(STORE_NAMES.PACKAGES).clear()
      transaction.objectStore(STORE_NAMES.ITEMS).clear()
      transaction.objectStore(STORE_NAMES.CACHE_META).clear()
      
      transaction.oncomplete = () => {
        console.log('IndexedDB cleared')
        resolve()
      }
      
      transaction.onerror = () => {
        reject(transaction.error)
      }
    })
  }
}

export const indexedDBStorage = new IndexedDBStorage()
