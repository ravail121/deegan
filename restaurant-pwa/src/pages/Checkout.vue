<template>
    <div class="wrap">
      <!-- Top Bar -->
      <header class="topbar">
        <button class="iconbtn" @click="$router.back()" aria-label="Back">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
  
        <div class="brand">
          <img src="/logo.png" alt="" class="logo">
          <span>Deegaan Restaurant</span>
        </div>
  
        <span class="spacer" />
      </header>
  
      <h1 class="title">CHECKOUT</h1>
  
      <!-- Items -->
      <main class="list" v-if="cart.items.length">
        <article v-for="(it, idx) in cart.items" :key="idx" class="line">
  <img :src="it.image || '/images/dishes/fish.jpg'" class="thumb" :alt="it.name" />
  <div class="info">
    <div class="top">
      <h3 class="name">{{ it.name }}</h3>
      <div class="qtybox">
        <button :disabled="it.qty===1" @click="cart.dec(idx)">−</button>
        <span>x{{ it.qty }}</span>
        <button @click="cart.inc(idx)">+</button>
      </div>
    </div>

    <ul class="meta">
      <li v-if="it.variant">Size: {{ it.variant.name }}</li>
      <li v-for="a in it.addOns || []" :key="a.id">+ {{ a.name }}</li>
    </ul>

    <!-- Trash at bottom right -->
    <button class="trash" aria-label="Remove item" @click="askDelete(idx)">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4h4v2"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</article>


      </main>
  
      <!-- Empty state -->
      <p v-else class="empty">Your cart is empty.</p>

      <section v-if="cart.items.length" class="summary">
  <div class="row">
    <span>Subtotal:</span>
    <strong>${{ cart.total.toFixed(2) }}</strong>
  </div>
  <div class="row">
    <span>Tax:</span>
    <strong>${{ (cart.total * taxRate).toFixed(2) }}</strong>
  </div>
  <div class="row total">
    <span>Total:</span>
    <strong>${{ (cart.total * (1+taxRate)).toFixed(2) }}</strong>
  </div>
  <p class="delivery">Estimated delivery: 25–30 min</p>

  <button class="orderbtn">PLACE ORDER</button>
</section>
  
      <!-- Confirm delete modal -->
      <div v-if="confirmIdx !== null" class="overlay" @click.self="confirmIdx=null">
        <div class="modal">
          <h3 class="confirm-title">Remove this item?</h3>
          <p class="confirm-text">Are you sure you want to remove it from your cart?</p>
          <div class="actions">
            <button class="cancel" @click="confirmIdx=null">Cancel</button>
            <button class="danger" @click="doDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useCart } from '../stores/cart'
  const cart = useCart()
  const taxRate = 0.08

  const confirmIdx = ref(null) // which item index to delete
  
  function askDelete(idx){ confirmIdx.value = idx }
  function doDelete(){
    if (confirmIdx.value !== null) cart.remove(confirmIdx.value)
    confirmIdx.value = null
  }
  </script>
  
  <style scoped>
  .wrap{min-height:100vh;background:#f7f7f4;color:#0f2a2a}
  
  /* Top bar */
  .topbar{
    position:sticky;top:0;z-index:10;height:56px;padding:0 12px;
    display:flex;align-items:center;gap:10px;
    background:#f7f7f4e6;backdrop-filter: blur(8px);border-bottom:1px solid rgba(0,0,0,.06);
  }
  .iconbtn{appearance:none;border:0;background:transparent;padding:6px;border-radius:10px;color:#0e3a3a;display:grid;place-items:center}
  .iconbtn:active{transform:scale(.96)}
  .brand{display:flex;align-items:center;gap:8px;font-weight:800;color:#0e3a3a}
  .logo{width:24px;height:24px;border-radius:50%}
  .spacer{flex:1}
  
  /* Title centered */
  .title{
    margin:14px 16px 8px;
    font-size:24px;font-weight:900;color:#0e3a3a;letter-spacing:.6px;
    text-align:center;
  }
  
  /* List / line item */
  .list{padding:0 12px 24px}
  .line{
    display:flex;gap:12px;align-items:flex-start;
    padding:12px;border:1px solid rgba(0,0,0,.06);background:#fff;border-radius:14px;
    box-shadow:0 4px 12px rgba(0,0,0,.05);
    margin-bottom:12px; position:relative;
  }
  .thumb{width:64px;height:64px;border-radius:10px;object-fit:cover}
  .info{flex:1;min-width:0}
  
  .name{margin:0;font-weight:800;font-size:16px;color:#102f2f}
  .top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.controls{display:flex;align-items:center;gap:8px}

/* qty */
.qtybox{display:flex;align-items:center;gap:10px;background:#f0f2ef;border-radius:10px;padding:4px 8px}
.qtybox button{
  width:28px;height:28px;border-radius:8px;border:none;background:#ffffff;
  box-shadow:0 1px 4px rgba(0,0,0,.08);font-size:18px;font-weight:700;color:#0e3a3a
}
.qtybox button:disabled{opacity:.45}
  .meta{list-style:none;margin:6px 0 0;padding:0;color:#3a5656;font-size:13px}
  .meta li{margin:2px 0}
  
  .line{
  position:relative;
  display:flex;gap:12px;align-items:flex-start;
  padding:12px;border:1px solid rgba(0,0,0,.06);
  background:#fff;border-radius:14px;
  box-shadow:0 4px 12px rgba(0,0,0,.05);
  margin-bottom:12px;
}

.trash{
  position:absolute; 
  right:12px; bottom:12px;
  display:grid;place-items:center;
  width:34px;height:34px;
  border-radius:10px;
  border:1px solid #f1d2d2;
  background:#fff;
  color:#b91c1c;
  box-shadow:0 2px 6px rgba(0,0,0,.06);
}

  /* Delete button (bottom-right) */
  .delbtn{
    position:absolute; right:12px; bottom:12px;
    background:#fff; color:#b91c1c; border:1px solid #f1d2d2;
    padding:6px 10px; border-radius:10px; font-weight:800; font-size:12px;
    box-shadow:0 2px 8px rgba(0,0,0,.06);
  }
  
  /* Empty state */
  .empty{padding:24px 16px;color:#3a5656;text-align:center}
  
  /* Confirm modal */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:50}
  .modal{background:#fff;width:90%;max-width:420px;border-radius:14px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.25);animation:fadeIn .2s ease}
  @keyframes fadeIn{from{opacity:.6;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .confirm-title{margin:0 0 6px;font-size:18px;font-weight:800;color:#0e3a3a;text-align:center}
  .confirm-text{margin:0 0 16px;color:#425e5e;font-size:14px;text-align:center}
  .actions{display:flex;gap:10px}
  .cancel,.danger{flex:1;padding:12px;border-radius:999px;border:none;font-weight:800;cursor:pointer}
  .cancel{background:#eef2f2;color:#0e3a3a}
  .danger{background:#dc2626;color:#fff}

  .summary{
  margin:20px 16px 40px;
  padding:16px;
  background:#fff;
  border-radius:14px;
  box-shadow:0 4px 12px rgba(0,0,0,.05);
  border:1px solid rgba(0,0,0,.06);
}
.row{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:10px;font-size:15px;color:#0f2a2a;
}
.row.total{font-size:17px;font-weight:900;color:#0e3a3a}
.delivery{
  margin:10px 0 16px;font-size:13px;color:#64706e;text-align:center;
}

.orderbtn{
  display:block;width:100%;
  background:#16a34a;color:#fff;
  border:none;border-radius:12px;
  padding:16px;font-size:17px;font-weight:800;
  letter-spacing:.5px;
  box-shadow:0 4px 12px rgba(0,0,0,.15);
}
.orderbtn:active{transform:scale(.98)}
.orderbtn:hover{background:#15803d}

  </style>
  