  <template>
    <div v-if="open" class="overlay" @click.self="$emit('close')">
      <div class="sheet">
        <h2 class="title">Filter Menu</h2>
  
        <!-- Search -->
        <section class="section">
          <h3>Search</h3>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search menu items..."
            class="search-input"
          />
        </section>

        <!-- Category -->
        <section class="section">
          <h3>Categories</h3>
          <div class="grid2">
            <label v-for="c in categories" :key="c.id" class="opt">
              <input 
                type="checkbox" 
                :checked="selectedCategories.includes(c.id)"
                @change="toggleCategory(c.id)"
              />
              <span>{{ c.label }}</span>
            </label>
          </div>
        </section>
  
        <!-- Price range -->
        <section class="section">
        <h3>Price Range</h3>
        <div class="rangebox">
            <input
            type="range"
            min="0"
            max="100"
            step="1"
            v-model="price"
            />
            <div class="range-label">
            Selected: $0 – ${{ price }}
            </div>
        </div>
        </section>

  
  
        <!-- Actions -->
        <div class="actions">
          <button class="ghost" @click="resetFilters">RESET</button>
          <button class="primary" @click="applyFilters">APPLY FILTERS</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'

const price = ref(20) // default slider value
const selectedCategories = ref([])
const searchQuery = ref('')

  const props = defineProps({
    open: Boolean,
    categories: { type: Array, default: () => [] },
    prices: { type: Array, default: () => [] }
  })
  
  const emit = defineEmits(['close', 'apply-filters'])

  // Handle category selection - now allows multiple selections
  const toggleCategory = (categoryId) => {
    const index = selectedCategories.value.indexOf(categoryId)
    if (index > -1) {
      selectedCategories.value.splice(index, 1) // Deselect category
    } else {
      selectedCategories.value.push(categoryId) // Add category to selection
    }
  }

  // Apply filters
  const applyFilters = () => {
    const filters = {
      categories: selectedCategories.value.map(id => {
        const category = props.categories.find(c => c.id === id)
        return { id: category.id, label: category.label }
      }),
      price: price.value,
      search: searchQuery.value.trim()
    }
    emit('apply-filters', filters)
  }

  // Reset filters
  const resetFilters = () => {
    selectedCategories.value = []
    price.value = 20
    searchQuery.value = ''
    // Emit reset event to clear all filters
    emit('apply-filters', { categories: [], price: null, search: '' })
  }
  </script>
  
  <style scoped>
  .overlay{
    position:fixed; inset:0; background:rgba(0,0,0,.55);
    display:flex; align-items:flex-end; justify-content:center; z-index:60;
  }
  .sheet{
    width:100%; max-width:520px; background:#fff; color:#0f2a2a;
    border-radius:20px 20px 0 0; padding:18px 16px 16px; max-height:90vh;
    overflow:auto; animation:slideUp .25s ease;
    font-family:'Poppins',sans-serif;
  }
  @keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
  
  .title{margin:0 0 6px; text-align:center; font-family:'Poppins',sans-serif; font-weight:700; font-size:22px; color:#0e3a3a}
  .section{margin:14px 2px; font-family:'Poppins',sans-serif;}
  .section h3{margin:0 0 10px; font-family:'Poppins',sans-serif; font-weight:600; font-size:16px; color:#163d3d}
  
  .grid2{
    display:grid; grid-template-columns:1fr 1fr; gap:10px 14px;
  }
  .opt{
    display:flex; align-items:center; gap:10px;
    padding:8px 10px; border:1px solid rgba(0,0,0,.08); border-radius:10px;
    background:#f7f7f4; font-family:'Poppins',sans-serif; font-weight:400; font-size:14px;
    cursor:pointer; transition:background .2s ease;
  }
  .opt:hover{
    background:#eef2f2;
  }
  .opt input{ width:18px; height:18px; cursor:pointer; }
  .opt span{
    font-family:'Poppins',sans-serif;
    font-weight:500;
    color:#0e3a3a;
  }
  
  .scroll{
    max-height:140px; overflow:auto; padding-right:4px;
  }
  
  .actions{
    display:flex; gap:10px; margin-top:14px;
  }
  .ghost, .primary{
    flex:1; padding:12px; border-radius:12px; font-family:'Poppins',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:.5px; border:none; cursor:pointer; transition:background .2s ease;
  }
  .ghost{ background:#eef2f2; color:#0e3a3a }
  .ghost:hover{ background:#dde5e5 }
  .primary{ background:#1a7a45; color:#fff }
  .primary:hover{ background:#146536 }
  .rangebox{
    padding:10px 4px;
  }
  .rangebox input[type=range]{
    width:100%;
    accent-color:#1a7a45;  /* green thumb/track */
    cursor:pointer;
  }
  .range-label{
    margin-top:6px;
    font-family:'Poppins',sans-serif;
    font-size:14px;
    font-weight:500;
    color:#0e3a3a;
  }
  .search-input{
    width:100%;
    padding:12px 16px;
    border:1px solid rgba(0,0,0,.12);
    border-radius:10px;
    font-family:'Poppins',sans-serif;
    font-size:14px;
    font-weight:400;
    background:#f7f7f4;
    color:#0e3a3a;
    transition:border-color .2s ease, background .2s ease;
  }
  .search-input:focus{
    outline:none;
    border-color:#1a7a45;
    background:#fff;
    box-shadow:0 0 0 3px rgba(26,122,69,.1);
  }
  .search-input::placeholder{
    color:#7a8c8c;
  }

  </style>
  