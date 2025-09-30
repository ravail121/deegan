<template>
    <div v-if="open" class="overlay" @click.self="$emit('close')">
      <div class="sheet">
        <h2 class="title">Filter Menu</h2>
  
        <!-- Category -->
        <section class="section">
          <h3>Category</h3>
          <div class="grid2">
            <label v-for="c in categories" :key="c.id" class="opt">
              <input type="checkbox" />
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

  
        <!-- Special options (just UI placeholders) -->
        <section class="section">
          <h3>Special Options</h3>
          <div class="grid2">
            <label class="opt"><input type="checkbox" /><span>Vegetarian only</span></label>
            <label class="opt"><input type="checkbox" /><span>Spicy dishes</span></label>
            <label class="opt"><input type="checkbox" /><span>Chef’s special</span></label>
          </div>
        </section>
  
        <!-- Actions -->
        <div class="actions">
          <button class="ghost" @click="$emit('close')">RESET</button>
          <button class="primary" @click="$emit('close')">APPLY FILTERS</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'

const price = ref(20) // default slider value

  defineProps({
    open: Boolean,
    categories: { type: Array, default: () => [] },
    prices: { type: Array, default: () => [] }
  })
  defineEmits(['close'])
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
  }
  @keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
  
  .title{margin:0 0 6px; text-align:center; font-weight:900; font-size:22px; color:#0e3a3a}
  .section{margin:14px 2px}
  .section h3{margin:0 0 10px; font-weight:800; font-size:16px; color:#163d3d}
  
  .grid2{
    display:grid; grid-template-columns:1fr 1fr; gap:10px 14px;
  }
  .opt{
    display:flex; align-items:center; gap:10px;
    padding:8px 10px; border:1px solid rgba(0,0,0,.08); border-radius:10px;
    background:#f7f7f4;
  }
  .opt input{ width:18px; height:18px }
  
  .scroll{
    max-height:140px; overflow:auto; padding-right:4px;
  }
  
  .actions{
    display:flex; gap:10px; margin-top:14px;
  }
  .ghost, .primary{
    flex:1; padding:12px; border-radius:12px; font-weight:800; border:none;
  }
  .ghost{ background:#eef2f2; color:#0e3a3a }
  .primary{ background:#1a7a45; color:#fff }
  .rangebox{
  padding:10px 4px;
}
.rangebox input[type=range]{
  width:100%;
  accent-color:#1a7a45;  /* green thumb/track */
}
.range-label{
  margin-top:6px;
  font-size:14px;
  font-weight:600;
  color:#0e3a3a;
}

  </style>
  