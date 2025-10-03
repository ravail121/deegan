<template>
    <div class="wrap">
      <!-- Top Bar -->
      <header class="topbar">
        <button class="iconbtn" @click="$router.back()" aria-label="Back">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="title">MENU</h1>
        <button class="iconbtn cartbtn" aria-label="Cart" @click="$router.push({ name:'checkout' })">

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
            <button class="filterbtn" @click="showFilters = true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M7 12h10M10 18h4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Filters</span>
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
  const categories = ref([{ id: 'all', name: 'All', emoji: '🍲' }])
  const activeCat = ref('all')

  // Fetch categories from API with offline support
  const fetchCategories = async () => {
    try {
      const data = await offlineStore.fetchPackages()
      console.log('Categories response:', data)
      
      if (data.success && data.data && data.data.length > 0) {
        // Add fetched categories after "ALL"
        const fetchedCategories = data.data.map(pkg => ({
          id: pkg.packageID.toString(),
          name: pkg.packageName,
          image: pkg.photo80 ? `https://menu.deegaan.so/assets/images/meals/packages/small80/${pkg.photo80}` : '/images/dishes/default.jpg'
        }))
        
        categories.value = [
          { id: 'all', name: 'All', emoji: '🍲', image: null },
          ...fetchedCategories
        ]
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  onMounted(async () => {
    // Get data from offline store (already loaded by app initialization)
    await fetchCategories()
    await fetchAllMenuItems()
    // Apply initial filters after data is loaded
    applyCurrentFilters()
  })
  
  // Menu items from API
  const items = ref([])
  const allItems = ref([]) // Store all fetched items
  const priceFilter = ref(null) // Track current price filter

  // Fetch all menu items with offline support
  const fetchAllMenuItems = async () => {
    try {
      const data = await offlineStore.fetchItems()
      console.log('All items response:', data)
      
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
          addons: item.active_addons || []
        }))
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }

  // Handle category click - now just filters locally instead of fetching
  const handleCategoryClick = (categoryId) => {
    activeCat.value = categoryId
    applyCurrentFilters()
  }
  
  // Apply current filters to allItems and update items
  const applyCurrentFilters = () => {
    let filtered = [...allItems.value]
    
    // Apply category filter
    if (activeCat.value !== 'all') {
      filtered = filtered.filter(item => item.cat === activeCat.value)
    }
    
    // Apply price filter if set
    if (priceFilter.value !== null) {
      filtered = filtered.filter(item => item.price <= priceFilter.value)
    }
    
    items.value = filtered
  }

  const filteredItems = computed(() => {
    return items.value
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
    console.log('Applying filters:', filters)
    
    // Apply price filter
    priceFilter.value = filters.price || null
    
    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      const selectedCategory = filters.categories[0] // Take first selected category
      activeCat.value = selectedCategory.id
    } else {
      activeCat.value = 'all'
    }
    
    // Apply all filters
    applyCurrentFilters()
    
    // Close the filter sheet
    showFilters.value = false
  }
  
  function onAdd(it){
    // For now just log; later connect to Pinia cart
    console.log('ADD', it.id)
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
  .title{margin:0; letter-spacing:.5px; font-weight:900; font-size:20px; color:#0e3a3a;}
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
  font-weight:800; font-size:14px;
  box-shadow:0 2px 6px rgba(0,0,0,.12);
}
  .pill{
    flex:0 0 auto; display:inline-flex; align-items:center; gap:8px;
    padding:10px 14px; border-radius:999px; border:1px solid rgba(0,0,0,.08);
    background:#ffffff; color:#0e3a3a; font-weight:700; font-size:14px;
    box-shadow:0 2px 6px rgba(0,0,0,.04); transition:background .2s ease, color .2s ease, transform .06s ease;
  }
  .pill:active{transform:scale(.98)}
  .pill-emoji{font-size:16px}
  .pill-image{width:16px;height:16px;object-fit:cover;border-radius:3px}
  .pill.active{ background:#0e3a3a; color:#fff; border-color:#0e3a3a; }
  
  /* List area */
  .list{
    padding:14px; padding-bottom:24px;
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
  padding:2px 7px; font-size:12px; font-weight:800;
  line-height:1;
}


  </style>
  