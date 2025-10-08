<template>
    <div class="wrap">
      <!-- Top Bar -->
      <header class="topbar">
        <button class="iconbtn" @click="$router.back()" :aria-label="t('Menu.backButton')">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="title">{{ t('Menu.title') }}</h1>
        <button class="iconbtn cartbtn" :aria-label="t('Menu.cartButton')" @click="$router.push({ name:'checkout' })">

            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/>
                <path d="M3 3h2l2.2 11.4a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.6L21 7H6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="cart.count" class="badge">{{ cart.count }}</span>
        </button>

      </header>
  
      <!-- Categories -->
      <nav class="cats" role="tablist" aria-label="Categories">
        <button
          v-for="c in categories" :key="c.id"
          class="pill" :class="{ active: c.id === activeCat }"
          role="tab" :aria-selected="c.id === activeCat"
          @click="handleCategoryClick(c.id)">
          <span class="pill-emoji">
            <img v-if="c.image" :src="c.image" :alt="c.name" class="pill-image" />
            <span v-else>{{ c.emoji }}</span>
          </span>
          <span class="pill-label">{{ c.name }}</span>
        </button>
      </nav>
      <div class="filters-row">
            <button class="filterbtn" :class="{ 'has-filters': hasActiveFilters }" @click="showFilters = true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M7 12h10M10 18h4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ t('Menu.filtersButton') }}</span>
                <span v-if="hasActiveFilters" class="filter-badge">{{ activeFilterCount }}</span>
            </button>
        </div>
      <!-- Items -->
      <main class="list">
        <MenuItemCard
          v-for="it in filteredItems"
          :key="it.id"
          :item="it"
          @add="onAdd"
        />
        
        <!-- Empty State -->
        <div v-if="filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">{{ t('Menu.emptyStateIcon') }}</div>
          <h3 class="empty-title">{{ t('Menu.emptyStateTitle') }}</h3>
          <p class="empty-text">{{ t('Menu.emptyStateText') }}</p>
          <button v-if="hasActiveFilters" class="reset-btn" @click="resetAllFilters">
            {{ t('Menu.clearFiltersButton') }}
          </button>
        </div>
      </main>
    </div>
    <FilterSheet
  :open="showFilters"
  :categories="filterCategories"
  :prices="priceOptions"
  @close="showFilters=false"
  @apply-filters="applyFilters"
/>

  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import MenuItemCard from '../components/MenuItemCard.vue'
  import FilterSheet from '../components/FilterSheet.vue'
  import { useCart } from '../stores/cart'
  import { useOfflineStore } from '../stores/offlineStore.js'
  import { getApiUrl, API_CONFIG } from '../config/api.js'
  import { t } from '../config/appText.js'
  const cart = useCart()
  const offlineStore = useOfflineStore()
  const showFilters = ref(false)

    const priceOptions = [
    { id:'p1', label:'$0 – $10' },
    { id:'p2', label:'$10 – $20' },
    { id:'p3', label:'$20 – $30' },
    { id:'p4', label:'$30 – $40' },
    { id:'p5', label:'$40 – $60' },
    { id:'p6', label:'$60+' }
    ]
  
  // Categories from API
  const categories = ref([{ id: 'all', name: t('Menu.allCategory'), emoji: t('Menu.allCategoryEmoji') }])
  const activeCat = ref('all')

  // Fetch categories from API with offline support
  const fetchCategories = async () => {
    try {
      const data = await offlineStore.fetchPackages()
      
      if (data.success && data.data && data.data.length > 0) {
        // Add fetched categories after "ALL"
        const fetchedCategories = data.data.map(pkg => ({
          id: pkg.packageID.toString(),
          name: pkg.packageName,
          image: pkg.photo80 ? `https://menu.deegaan.so/assets/images/meals/packages/small80/${pkg.photo80}` : '/images/dishes/default.jpg'
        }))
      
      categories.value = [
        { id: 'all', name: t('Menu.allCategory'), emoji: t('Menu.allCategoryEmoji'), image: null },
        ...fetchedCategories
      ]
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Menu items from API
  const items = ref([])
  const allItems = ref([]) // Store all fetched items
  const priceFilter = ref(null) // Track current price filter
  const categoryFilters = ref([]) // Track selected categories from filter
  const searchQuery = ref('') // Track search query

  // Load data from offline store cache
  const loadCachedData = () => {
    // Load categories from cached packages
    const cachedPackages = offlineStore.getCachedPackages
    if (cachedPackages && cachedPackages.length > 0) {
      const fetchedCategories = cachedPackages.map(pkg => ({
        id: pkg.packageID.toString(),
        name: pkg.packageName,
        image: pkg.photo80 ? `https://menu.deegaan.so/assets/images/meals/packages/small80/${pkg.photo80}` : '/images/dishes/default.jpg'
      }))
      
      categories.value = [
        { id: 'all', name: t('Menu.allCategory'), emoji: t('Menu.allCategoryEmoji'), image: null },
        ...fetchedCategories
      ]
    }
    
    // Load items from cached items
    const cachedItems = offlineStore.getCachedItems
    if (cachedItems && cachedItems.length > 0) {
      allItems.value = cachedItems.map(item => ({
        id: item.itemID.toString(),
        name: item.itemName,
        price: parseFloat(item.costPrice),
        desc: item.description || '',
        cat: item.packageID.toString(),
        image: item.photo320 ? `https://menu.deegaan.so/assets/images/meals/items/middle320/${item.photo320}` : '/images/dishes/default.jpg',
        badge: item.isVegetarian ? 'Vegetarian' : (item.isSpicy ? 'Spicy' : ''),
        sizes: item.active_sizes || [],
        addons: item.active_addons || [],
        notes: item.notes || []
      }))
    }
  }

  // Fetch all menu items with offline support
  const fetchAllMenuItems = async () => {
    try {
      const data = await offlineStore.fetchItems()
      
      if (data.success && data.data) {
        allItems.value = data.data.map(item => ({
          id: item.itemID.toString(),
          name: item.itemName,
          price: parseFloat(item.costPrice),
          desc: item.description || '',
          cat: item.packageID.toString(),
          image: item.photo320 ? `https://menu.deegaan.so/assets/images/meals/items/middle320/${item.photo320}` : '/images/dishes/default.jpg',
          badge: item.isVegetarian ? 'Vegetarian' : (item.isSpicy ? 'Spicy' : ''),
          sizes: item.active_sizes || [],
          addons: item.active_addons || [],
          notes: item.notes || []
        }))
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }
  
  onMounted(async () => {
    // Get data from offline store (already loaded by app initialization)
    // Check if data is already cached, if so use it instead of fetching again
    if (offlineStore.hasOfflineData) {
      // Use cached data - instant, no API calls!
      loadCachedData()
    } else {
      // Fetch if not cached yet (fallback)
      await fetchCategories()
      await fetchAllMenuItems()
    }
    // Apply initial filters after data is loaded
    applyCurrentFilters()
  })

  // Handle category click - now just filters locally instead of fetching
  const handleCategoryClick = (categoryId) => {
    activeCat.value = categoryId
    // Clear filter categories when using top nav
    categoryFilters.value = []
    applyCurrentFilters()
  }
  
  // Apply current filters to allItems and update items
  const applyCurrentFilters = () => {
    let filtered = [...allItems.value]
    
    // Apply category filter from top navigation
    if (activeCat.value !== 'all' && categoryFilters.value.length === 0) {
      filtered = filtered.filter(item => item.cat === activeCat.value)
    }
    
    // Apply multiple category filters from filter sheet
    if (categoryFilters.value.length > 0) {
      filtered = filtered.filter(item => categoryFilters.value.includes(item.cat))
    }
    
    // Apply price filter if set
    if (priceFilter.value !== null) {
      filtered = filtered.filter(item => item.price <= priceFilter.value)
    }
    
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query)
      )
    }
    
    items.value = filtered
  }

  const filteredItems = computed(() => {
    return items.value
  })

  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return categoryFilters.value.length > 0 || searchQuery.value !== '' || (priceFilter.value !== null && priceFilter.value !== 20)
  })

  // Count active filters
  const activeFilterCount = computed(() => {
    let count = 0
    if (categoryFilters.value.length > 0) count += categoryFilters.value.length
    if (searchQuery.value !== '') count += 1
    if (priceFilter.value !== null && priceFilter.value !== 20) count += 1
    return count
  })

  // Filter categories for FilterSheet (exclude 'all')
  const filterCategories = computed(() => {
    return categories.value.filter(cat => cat.id !== 'all').map(cat => ({
      id: cat.id,
      label: cat.name
    }))
  })

  // Apply filters from FilterSheet
  const applyFilters = (filters) => {
    
    // Apply price filter
    priceFilter.value = filters.price || null
    
    // Apply search filter
    searchQuery.value = filters.search || ''
    
    // Apply multiple category filters
    if (filters.categories && filters.categories.length > 0) {
      categoryFilters.value = filters.categories.map(c => c.id)
      activeCat.value = 'all' // Reset top nav to "All" when using filter
    } else {
      categoryFilters.value = []
      activeCat.value = 'all'
    }
    
    // Apply all filters
    applyCurrentFilters()
    
    // Close the filter sheet
    showFilters.value = false
  }
  
  // Reset all filters
  const resetAllFilters = () => {
    categoryFilters.value = []
    priceFilter.value = null
    searchQuery.value = ''
    activeCat.value = 'all'
    applyCurrentFilters()
  }
  
  function onAdd(it){
    // For now just log; later connect to Pinia cart
  }
  </script>
  
  <style scoped>
  .wrap{min-height:100vh;background:#f7f7f4;color:#0f2a2a}
  
  /* Top bar */
  .topbar{
    position:sticky; top:0; z-index:10;
    display:flex; align-items:center; justify-content:space-between;
    height:56px; padding:0 14px; background:#f7f7f4e6; backdrop-filter:saturate(1.2) blur(8px);
    border-bottom:1px solid rgba(0,0,0,.06);
  }
  .title{margin:0; font-family:'Poppins',sans-serif; letter-spacing:.5px; font-weight:800; font-size:20px; color:#0e3a3a;}
  .iconbtn{appearance:none; border:0; background:transparent; padding:6px; border-radius:10px; color:#0e3a3a; display:grid; place-items:center;}
  .iconbtn:active{transform:scale(.96)}
  
  /* Categories */
  .cats{
    position:sticky; top:56px; z-index:9;
    display:flex; gap:10px; align-items:center;
    padding:12px 14px; background:#f7f7f4; border-bottom:1px solid rgba(0,0,0,.05);
    overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none;
  }
  .cats::-webkit-scrollbar{display:none}
  .spacer{ flex:1 0 auto } /* pushes the Filters button to the right */

  .filters-row{
  display:flex;
  justify-content:flex-end;
  align-items:center;
  padding:10px 14px 0;   /* match page gutters */
  background:#f7f7f4;    /* same bg as page */
}

.filterbtn{
  display:inline-flex; align-items:center; gap:8px;
  padding:10px 14px; border-radius:999px;
  border:1px solid rgba(0,0,0,.12);
  background:#0e3a3a; color:#fff;
  font-family:'Poppins',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:.5px; font-size:14px;
  box-shadow:0 2px 6px rgba(0,0,0,.12);
  transition:background .2s ease;
  position:relative;
}
.filterbtn:hover{
  background:#0c3030;
}
.filterbtn.has-filters{
  background:#1a7a45;
  border-color:#1a7a45;
}
.filterbtn.has-filters:hover{
  background:#146536;
}
.filter-badge{
  background:#fff;
  color:#1a7a45;
  border-radius:999px;
  padding:2px 7px;
  font-size:11px;
  font-weight:800;
  line-height:1;
  min-width:18px;
  text-align:center;
}
  .pill{
    flex:0 0 auto; display:inline-flex; align-items:center; gap:8px;
    padding:10px 14px; border-radius:999px; border:1px solid rgba(0,0,0,.08);
    background:#ffffff; color:#0e3a3a; font-family:'Poppins',sans-serif; font-weight:600; font-size:14px;
    box-shadow:0 2px 6px rgba(0,0,0,.04); transition:background .2s ease, color .2s ease, transform .06s ease;
  }
  .pill:active{transform:scale(.98)}
  .pill-emoji{font-size:16px}
  .pill-image{width:16px;height:16px;object-fit:cover;border-radius:3px}
  .pill.active{ background:#0e3a3a; color:#fff; border-color:#0e3a3a; }
  
  /* List area */
  .list{
    padding:14px; padding-bottom:24px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  /* iPad and larger screens - 2 columns */
  @media (min-width: 768px) and (max-width: 1024px) {
    .list {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 16px;
    }
  }

  /* Large screens - 3 columns */
  @media (min-width: 1025px) {
    .list {
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      padding: 18px;
      max-width: 1200px;
      margin: 0 auto;
    }
  }

  .welcome {
  font-family: var(--font-heading);
  font-size: clamp(22px,5vw,34px);
  font-weight: 700;
}
.brand {
  font-family: var(--font-heading);
  font-weight: 700;
}
.subtitle {
  font-family: var(--font-base);
  color: #d1d5db;
}
.name {
  font-family: var(--font-heading);
  font-weight: 700;
}
.desc {
  font-family: var(--font-base);
}

.cartbtn{ position: relative; }
.cartbtn .badge{
  position:absolute; top:-4px; right:-4px;
  background:#dc2626; color:#fff; border-radius:999px;
  padding:2px 7px; font-family:'Poppins',sans-serif; font-size:12px; font-weight:700;
  line-height:1;
}

/* Empty State */
.empty-state{
  grid-column:1 / -1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:60px 20px;
  text-align:center;
}
.empty-icon{
  font-size:64px;
  margin-bottom:16px;
  opacity:.5;
}
.empty-title{
  margin:0 0 8px;
  font-family:'Poppins',sans-serif;
  font-size:22px;
  font-weight:700;
  color:#0e3a3a;
}
.empty-text{
  margin:0 0 20px;
  font-family:'Poppins',sans-serif;
  font-size:14px;
  font-weight:400;
  color:#7a8c8c;
  max-width:300px;
}
.reset-btn{
  padding:12px 24px;
  border-radius:999px;
  border:none;
  background:#1a7a45;
  color:#fff;
  font-family:'Poppins',sans-serif;
  font-size:14px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.5px;
  cursor:pointer;
  box-shadow:0 4px 12px rgba(26,122,69,.3);
  transition:background .2s ease, transform .06s ease;
}
.reset-btn:hover{
  background:#146536;
}
.reset-btn:active{
  transform:scale(.98);
}


  </style>
  