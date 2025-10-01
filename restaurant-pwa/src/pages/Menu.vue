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
          v-for="c in categories"
          :key="c.id"
          class="pill"
          :class="{ active: c.id === activeCat }"
          role="tab"
          :aria-selected="c.id === activeCat"
          @click="activeCat = c.id">
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
/>

  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import MenuItemCard from '../components/MenuItemCard.vue'
  import FilterSheet from '../components/FilterSheet.vue'
  import { useCart } from '../stores/cart'
  const cart = useCart()
  const showFilters = ref(false)

    const priceOptions = [
    { id:'p1', label:'$0 – $10' },
    { id:'p2', label:'$10 – $20' },
    { id:'p3', label:'$20 – $30' },
    { id:'p4', label:'$30 – $40' },
    { id:'p5', label:'$40 – $60' },
    { id:'p6', label:'$60+' }
    ]
  const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  const PACKAGES_ENDPOINT = `${API_BASE_URL}/api/packages`

  const defaultCategory = { id: 'all', name: 'All' }
  const categories = ref([defaultCategory])
  const activeCat = ref(defaultCategory.id)

  const filterCategories = computed(() =>
    categories.value
      .filter(c => c.id !== defaultCategory.id)
      .map(c => ({ id: c.id, label: c.name }))
  )

  async function loadCategories() {
    try {
      const response = await fetch(PACKAGES_ENDPOINT)
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)
      const result = await response.json()
      const apiCategories = Array.isArray(result?.data)
        ? result.data.map(pkg => ({
            id: String(pkg.packageID ?? pkg.id ?? ''),
            name: pkg.packageName ?? pkg.name ?? 'Unnamed'
          })).filter(cat => cat.id)
        : []
      categories.value = [defaultCategory, ...apiCategories]
    } catch (error) {
      console.error('Failed to load categories', error)
    }
  }

  onMounted(loadCategories)
  
  // Hardcoded sample data (images: put files in /public/images/dishes/)
  const items = ref([
    { id:'fish-pakora', name:'Fish Pakora', price:8.00,  desc:'Spicy fried fish with chutney', cat:'starters', image:'/images/dishes/fish.jpg', badge:'Halal' },
    { id:'chicken-curry', name:'Chicken Curry', price:12.00, desc:'Rich tomato gravy, coriander', cat:'mains', image:'/images/dishes/curry.jpg', badge:'Popular' },
    { id:'lamb-biryani', name:'Lamb Biryani', price:14.00, desc:'Aromatic rice, tender lamb', cat:'biryani', image:'/images/dishes/biryani.jpg' },
    { id:'paneer-tikka', name:'Paneer Tikka', price:11.00, desc:'Char-grilled cottage cheese', cat:'veg', image:'/images/dishes/paneer.jpg' },
    { id:'seekh-kebab', name:'Seekh Kebab', price:10.00, desc:'Minced meat skewers', cat:'grill', image:'/images/dishes/kebab.jpg' },
    { id:'mango-lassi', name:'Mango Lassi', price:4.00,  desc:'Sweet mango yogurt drink', cat:'drinks', image:'/images/dishes/lassi.jpg' }
  ])
  
  const filteredItems = computed(() =>
    activeCat.value === 'all' ? items.value : items.value.filter(i => i.cat === activeCat.value)
  )
  
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
    flex:0 0 auto; display:inline-flex; align-items:center; justify-content:center;
    padding:10px 18px; border-radius:999px; border:1px solid rgba(0,0,0,.08);
    background:#ffffff; color:#0e3a3a; font-weight:700; font-size:14px;
    box-shadow:0 2px 6px rgba(0,0,0,.04); transition:background .2s ease, color .2s ease, transform .06s ease;
  }
  .pill:active{transform:scale(.98)}
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
  
