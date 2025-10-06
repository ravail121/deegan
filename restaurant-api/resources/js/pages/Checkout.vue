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
      <li v-if="it.variant">Size: {{ it.variant.sizeName }} (${{ Number(it.variant.price).toFixed(2) }})</li>
      <li v-for="a in it.addOns || []" :key="a.id">+ {{ a.name }}</li>
      <li v-if="it.notes" class="notes">Note: {{ it.notes }}</li>
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
  
  <!-- VAT Row - Always show if VAT percentage > 0 -->
  <div class="row" v-if="parseFloat(settingsStore.getVATPercentage) > 0">
    <span>{{ settingsStore.getVATDisplayText }}:</span>
    <strong>${{ settingsStore.calculateVAT(cart.total).toFixed(2) }}</strong>
  </div>
  
  <!-- Tax Row - Fallback for when VAT is 0 or not loaded -->
  <div class="row" v-else>
    <span>Tax:</span>
    <strong>$0.00</strong>
  </div>
  
  <div class="row total">
    <span>Total:</span>
    <strong>${{ settingsStore.calculateTotalWithVAT(cart.total).toFixed(2) }}</strong>
  </div>
  
  <!-- Debug info (remove in production) -->
  <!-- <div class="debug-info" style="font-size: 12px; color: #666; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
    <div>VAT Percentage: {{ settingsStore.getVATPercentage }}%</div>
    <div>VAT Enabled: {{ settingsStore.isVATEnabled }}</div>
    <div>Subtotal: ${{ cart.total.toFixed(2) }}</div>
    <div>VAT Amount: ${{ settingsStore.calculateVAT(cart.total).toFixed(2) }}</div>
    <div>Total with VAT: ${{ settingsStore.calculateTotalWithVAT(cart.total).toFixed(2) }}</div>
    <div>Settings loaded: {{ settingsStore.lastFetched ? 'Yes' : 'No' }}</div>
  </div> -->
  
  <p class="delivery">Estimated delivery: 25–30 min</p>

  <button class="orderbtn" @click="placeOrder" :disabled="isPlacingOrder">
    {{ isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER' }}
  </button>
</section>
  
      <!-- Order placement loader -->
      <div v-if="isPlacingOrder" class="order-loader-overlay">
        <div class="order-loader">
          <div class="loader-spinner"></div>
          <h3>Placing Your Order...</h3>
          <p>Please wait while we process your order and create all necessary records.</p>
        </div>
      </div>

      <!-- Success modal -->
      <div v-if="showSuccessModal" class="success-modal-overlay">
        <div class="success-modal">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Order Placed Successfully!</h3>
          <p v-if="orderSuccessData">Order ID: {{ orderSuccessData.orderID }}</p>
          <p>Your order has been received and is being prepared.</p>
          <button class="back-to-menu-btn" @click="backToMenu">Back to Menu</button>
        </div>
      </div>

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
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCart } from '../stores/cart'
  import { useSettingsStore } from '../stores/settingsStore.js'
  import { useTableStore } from '../stores/tableStore.js'
  import axios from 'axios'
  
  const router = useRouter()
  const cart = useCart()
  const settingsStore = useSettingsStore()
  const tableStore = useTableStore()
  const confirmIdx = ref(null) // which item index to delete
  const isPlacingOrder = ref(false)
  const showSuccessModal = ref(false)
  const orderSuccessData = ref(null)

  // Initialize settings on component mount
  onMounted(async () => {
    // If settings are not loaded, try to fetch them
    if (!settingsStore.lastFetched) {
      await settingsStore.fetchSettings()
    }
  })
  
  function askDelete(idx){ confirmIdx.value = idx }
  function doDelete(){
    if (confirmIdx.value !== null) cart.remove(confirmIdx.value)
    confirmIdx.value = null
  }

  function backToMenu() {
    showSuccessModal.value = false
    router.push('/')
  }

  async function placeOrder() {
    if (!tableStore.hasTableData) {
      alert('Please scan a table QR code first')
      return
    }

    if (cart.items.length === 0) {
      alert('Your cart is empty')
      return
    }

    isPlacingOrder.value = true

    try {
      // Prepare order data
      const orderData = {
        items: cart.items.map(item => ({
          itemID: item.id,
          quantity: item.qty,
          notes: item.notes || ''
        })),
        tableName: tableStore.getTableName,
        tableID: tableStore.getTableID,
        whouseID: tableStore.getWhouseID
      }


      // Call the API
      const response = await axios.post('/api/orders', orderData)

      if (response.data.success) {
        // Store success data
        orderSuccessData.value = response.data.data
        
        // Clear cart
        cart.clearCart()
        
        // Show success modal
        showSuccessModal.value = true
      } else {
        throw new Error(response.data.message || 'Failed to place order')
      }

    } catch (error) {
      console.error('Order placement failed:', error)
      alert(`Failed to place order: ${error.response?.data?.message || error.message}`)
    } finally {
      isPlacingOrder.value = false
    }
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
  .brand{display:flex;align-items:center;gap:8px;font-family:'Poppins',sans-serif; font-weight:700;color:#0e3a3a}
  .logo{width:24px;height:24px;border-radius:50%}
  .spacer{flex:1}
  
  /* Title centered */
  .title{
    margin:14px 16px 8px;
    font-family:'Poppins',sans-serif; font-size:24px;font-weight:800;color:#0e3a3a;letter-spacing:.6px;
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
  .info{flex:1;min-width:0;padding-bottom:50px;position:relative}
  
  .name{margin:0;font-family:'Poppins',sans-serif; font-weight:600;font-size:16px;color:#102f2f}
  .top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.controls{display:flex;align-items:center;gap:8px}

/* qty */
.qtybox{display:flex;align-items:center;gap:12px;background:#f0f2ef;border-radius:10px;padding:6px 10px}
.qtybox button{
  width:36px;height:36px;border-radius:8px;border:none;background:#ffffff;
  box-shadow:0 1px 4px rgba(0,0,0,.08);font-family:'Poppins',sans-serif; font-size:20px;font-weight:700;color:#0e3a3a;
  cursor:pointer;transition:background .2s ease
}
.qtybox button:hover{background:#f8f8f8}
.qtybox button:active{transform:scale(.95)}
.qtybox button:disabled{opacity:.45;cursor:not-allowed}
  .meta{list-style:none;margin:6px 0 0;padding:0;color:#3a5656;font-family:'Poppins',sans-serif; font-size:13px;font-weight:400;padding-right:50px}
  .meta li{margin:2px 0}
  .meta li.notes{color:#0e3a3a;font-style:italic;background:#f0f2ef;padding:4px 8px;border-radius:6px;margin-top:4px}
  
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
  right:12px; bottom:8px;
  display:grid;place-items:center;
  width:34px;height:34px;
  border-radius:10px;
  border:1px solid #f1d2d2;
  background:#fff;
  color:#b91c1c;
  box-shadow:0 2px 6px rgba(0,0,0,.06);
  z-index:2;
}

  /* Delete button (bottom-right) */
  .delbtn{
    position:absolute; right:12px; bottom:12px;
    background:#fff; color:#b91c1c; border:1px solid #f1d2d2;
    padding:6px 10px; border-radius:10px; font-weight:800; font-size:12px;
    box-shadow:0 2px 8px rgba(0,0,0,.06);
  }
  
  /* Empty state */
  .empty{padding:24px 16px;color:#3a5656;text-align:center;font-family:'Poppins',sans-serif; font-weight:400}
  
  /* Confirm modal */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:50}
  .modal{background:#fff;width:90%;max-width:420px;border-radius:14px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.25);animation:fadeIn .2s ease}
  @keyframes fadeIn{from{opacity:.6;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .confirm-title{margin:0 0 6px;font-family:'Poppins',sans-serif; font-size:18px;font-weight:700;color:#0e3a3a;text-align:center}
  .confirm-text{margin:0 0 16px;color:#425e5e;font-family:'Poppins',sans-serif; font-size:14px;font-weight:400;text-align:center}
  .actions{display:flex;gap:10px}
  .cancel,.danger{flex:1;padding:12px;border-radius:999px;border:none;font-family:'Poppins',sans-serif; font-weight:700;text-transform:uppercase;letter-spacing:.5px;cursor:pointer}
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
  margin-bottom:10px;font-family:'Poppins',sans-serif; font-size:15px;font-weight:400;color:#0f2a2a;
}
.row.total{font-size:17px;font-weight:700;color:#0e3a3a}
.delivery{
  margin:10px 0 16px;font-family:'Poppins',sans-serif; font-size:13px;font-weight:400;color:#64706e;text-align:center;
}

.orderbtn{
  display:block;width:100%;
  background:#16a34a;color:#fff;
  border:none;border-radius:12px;
  padding:16px;font-family:'Poppins',sans-serif; font-size:17px;font-weight:700;
  text-transform:uppercase; letter-spacing:.8px;
  box-shadow:0 4px 12px rgba(0,0,0,.15);
}
.orderbtn:active{transform:scale(.98)}
.orderbtn:hover{background:#15803d}
  .orderbtn:disabled{
    background:#9ca3af;
    cursor:not-allowed;
    transform:none;
  }
  .orderbtn:disabled:hover{background:#9ca3af}

  /* Order placement loader */
  .order-loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  }

  .order-loader {
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    max-width: 320px;
    width: 90%;
  }

  .loader-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #0f2a2a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .order-loader h3 {
    margin: 0 0 12px 0;
    color: #0f2a2a;
    font-family:'Poppins',sans-serif; font-size: 18px;
    font-weight: 600;
  }

  .order-loader p {
    margin: 0;
    color: #666;
    font-family:'Poppins',sans-serif; font-size: 14px;
    font-weight: 400;
    line-height: 1.4;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Success modal */
  .success-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  }

  .success-modal {
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    max-width: 360px;
    width: 90%;
    animation: successModalSlideIn 0.3s ease-out;
  }

  .success-icon {
    color: #22c55e;
    margin-bottom: 20px;
    animation: successIconBounce 0.6s ease-out;
  }

  .success-modal h3 {
    margin: 0 0 16px 0;
    color: #0f2a2a;
    font-family:'Poppins',sans-serif; font-size: 20px;
    font-weight: 600;
  }

  .success-modal p {
    margin: 0 0 12px 0;
    color: #666;
    font-family:'Poppins',sans-serif; font-size: 14px;
    font-weight: 400;
    line-height: 1.4;
  }

  .success-modal p:last-of-type {
    margin-bottom: 24px;
  }

  .back-to-menu-btn {
    background: #0f2a2a;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-family:'Poppins',sans-serif; font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
  }

  .back-to-menu-btn:hover {
    background: #1a3a3a;
    transform: translateY(-1px);
  }

  .back-to-menu-btn:active {
    transform: translateY(0);
  }

  @keyframes successModalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes successIconBounce {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  </style>
  