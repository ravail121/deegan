<template>
    <article class="card">
      <img :src="item.image" :alt="item.name" class="photo" />
  
      <div class="row head">
        <h3 class="name">{{ item.name }}</h3>
        <div class="price">${{ Number(item.price).toFixed(2) }}</div>
      </div>
  
      <p class="desc">{{ item.desc }}</p>
  
      <div class="row foot">
        <!-- badges area (optional icons/text) -->
        <div class="badges" v-if="item.badge">
          <span class="badge">{{ item.badge }}</span>
        </div>
  
        <button class="add" @click="showModal = true">ADD</button>
      </div>
  
      <!-- Modal -->
      <div v-if="showModal" class="overlay">
        <div class="modal">
          <h2 class="title">{{ item.name }}</h2>
  
          <!-- Variants -->
          <section class="section" v-if="item.sizes && item.sizes.length > 0">
            <h3>Choose Size</h3>
            <label v-for="size in item.sizes" :key="size.sizeID" class="option">
              <input type="radio" name="variant" :value="size" v-model="selectedVariant" />
              {{ size.sizeName }} (${{ Number(size.price).toFixed(2) }})
            </label>
          </section>
  
          <!-- Add-ons -->
          <section class="section" v-if="item.addons && item.addons.length > 0">
            <h3>Add-ons</h3>
            <label v-for="addon in item.addons" :key="addon.addonID" class="option">
              <input type="checkbox" :value="addon" v-model="selectedAddOns" />
              {{ addon.addonName }} (+${{ Number(addon.price).toFixed(2) }})
            </label>
          </section>
  
          <!-- Quantity -->
          <section class="section row">
            <h3>Quantity</h3>
            <div class="qty">
              <button @click="qty > 0 && qty--">-</button>
              <span :class="{ 'qty-zero': qty === 0 }">{{ qty }}</span>
              <button @click="qty++">+</button>
            </div>
          </section>
          
          <!-- Remove warning when quantity is 0 -->
          <div v-if="qty === 0 && cartItemIndex !== -1" class="remove-warning">
            ⚠️ This item will be removed from your cart
          </div>

          <!-- Customer Notes -->
          <section class="section">
            <MealNotesInput 
              :preset-notes="item.notes || []"
              v-model="customerNotes"
            />
          </section>
  
          <!-- Actions -->
          <div class="actions">
            <button class="cancel" @click="showModal = false">Cancel</button>
            <button class="confirm" @click="confirmAdd">Add to Cart</button>
          </div>
        </div>
      </div>
    </article>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  import { useCart } from '../stores/cart'
  import MealNotesInput from './MealNotesInput.vue'
  
  const props = defineProps({
    item: { type: Object, required: true }
  })
  const cart = useCart()
  const showModal = ref(false)
  const qty = ref(1)
  const selectedVariant = ref(null)
  const selectedAddOns = ref([])
  const customerNotes = ref('')
  const cartItemIndex = ref(null)
  
  // Find existing cart item with same id and variant
  const findCartItem = () => {
    return cart.items.findIndex(i =>
      i.id === props.item.id &&
      selectedVariant.value?.sizeID === i.variant?.sizeID
    )
  }
  
  // Reset modal state when opening
  watch(showModal, (isOpen) => {
    if (isOpen) {
      selectedAddOns.value = []
      customerNotes.value = ''
      // Auto-select first size if available
      selectedVariant.value = props.item.sizes && props.item.sizes.length > 0 ? props.item.sizes[0] : null
      
      // Check if item already exists in cart
      cartItemIndex.value = findCartItem()
      if (cartItemIndex.value !== -1) {
        // Item exists in cart, show current quantity
        const existingItem = cart.items[cartItemIndex.value]
        qty.value = existingItem.qty
        customerNotes.value = existingItem.notes || ''
        if (existingItem.addOns) {
          selectedAddOns.value = [...existingItem.addOns]
        }
      } else {
        // New item, start with quantity 1
        qty.value = 1
      }
    }
  })
  
  // Update cart item index when variant changes
  watch(selectedVariant, () => {
    if (showModal.value) {
      cartItemIndex.value = findCartItem()
      if (cartItemIndex.value !== -1) {
        const existingItem = cart.items[cartItemIndex.value]
        qty.value = existingItem.qty
        customerNotes.value = existingItem.notes || ''
        if (existingItem.addOns) {
          selectedAddOns.value = [...existingItem.addOns]
        }
      } else {
        qty.value = 1
        customerNotes.value = ''
        selectedAddOns.value = []
      }
    }
  })
  
  function confirmAdd() {
    const addOnsTotal = selectedAddOns.value.reduce((t, a) => t + Number(a.price), 0)
    // Use size price if selected, otherwise use base item price
    const basePrice = selectedVariant.value ? Number(selectedVariant.value.price) : props.item.price
    
    // If quantity is 0, remove from cart
    if (qty.value === 0) {
      if (cartItemIndex.value !== -1) {
        cart.remove(cartItemIndex.value)
      }
      showModal.value = false
      return
    }
    
    // If item exists in cart, update it
    if (cartItemIndex.value !== -1) {
      const existingItem = cart.items[cartItemIndex.value]
      existingItem.qty = qty.value
      existingItem.price = basePrice + addOnsTotal
      existingItem.addOns = selectedAddOns.value
      existingItem.notes = customerNotes.value
      existingItem.presetNotes = props.item.notes || [] // Update preset notes
      cart.saveToStorage()
    } else {
      // Add new item to cart
      cart.add({
        id: props.item.id,
        name: props.item.name,
        image: props.item.image,  
        price: basePrice + addOnsTotal,
        variant: selectedVariant.value,
        addOns: selectedAddOns.value,
        qty: qty.value,
        notes: customerNotes.value,
        presetNotes: props.item.notes || [] // Store preset notes for editing in cart
      })
    }
    showModal.value = false
  }
  </script>
  
  <style scoped>
  /* existing card styles */
  .card{
    background:#f9f7f2;
    border-radius:16px;
    padding:12px;
    box-shadow:0 4px 14px rgba(0,0,0,.06);
    border:1px solid rgba(0,0,0,.05);
    margin-bottom:0; /* Remove margin since grid handles spacing */
    height: fit-content; /* Prevent stretching */
    display: flex;
    flex-direction: column;
  }
  .photo{width:100%;height:140px;object-fit:cover;border-radius:12px}
  .row{display:flex;align-items:center;justify-content:space-between}
  .head{margin-top:10px}
  .name{margin:0;font-family:'Poppins',sans-serif;font-weight:600;color:#153c3c;font-size:clamp(18px,4.5vw,22px)}
  .price{font-family:'Poppins',sans-serif;font-weight:700;color:#153c3c;font-size:16px}
  .desc{margin:6px 0 8px;font-family:'Poppins',sans-serif;font-weight:400;color:#425e5e;font-size:14px;line-height:1.3;flex-grow:1}
  .foot{margin-top:auto;padding-top:6px}
  .badges{display:flex;gap:8px;align-items:center}
  .badge{padding:6px 10px;border-radius:999px;font-size:12px;font-family:'Poppins',sans-serif;font-weight:700;color:#1b5a3d;background:#e6f2ea;border:1px solid #d5e8de}
  .add{margin-left:auto;background:#0e3a3a;color:#fff;font-family:'Poppins',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.8px;border:0;border-radius:999px;padding:10px 16px;min-width:84px;box-shadow:0 6px 14px rgba(0,0,0,.15);transition:transform .06s ease, background .2s ease}
  .add:active{transform:scale(.98)}
  .add:hover{background:#0c3030}
  
  /* modal styles */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;z-index:50}
  .modal{background:#fff;width:100%;max-width:500px;border-radius:20px 20px 0 0;padding:20px;max-height:90vh;overflow-y:auto;animation:slideUp .3s ease}
  @keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
  .title{margin:0 0 12px;font-family:'Poppins',sans-serif;font-size:20px;font-weight:700;text-align:center}
  .section{margin:16px 0}
  .section h3{margin:0 0 8px;font-family:'Poppins',sans-serif;font-size:16px;font-weight:600}
  .option{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:400}
  .qty{display:flex;align-items:center;gap:16px;font-family:'Poppins',sans-serif;font-size:16px;font-weight:700}
  .qty button{width:40px;height:40px;border-radius:50%;border:none;background:#eee;font-family:'Poppins',sans-serif;font-weight:700;font-size:18px;cursor:pointer;transition:background .2s ease}
  .qty button:hover{background:#ddd}
  .qty button:active{transform:scale(.95)}
  .qty-zero{color:#dc2626;font-weight:800}
  .remove-warning{
    margin:8px 0 0;
    padding:8px 12px;
    background:#fef2f2;
    border:1px solid #fecaca;
    border-radius:8px;
    color:#dc2626;
    font-family:'Poppins',sans-serif;
    font-size:13px;
    font-weight:500;
    text-align:center;
  }
  .actions{display:flex;justify-content:space-between;margin-top:20px;gap:10px}
  .cancel,.confirm{flex:1;padding:12px;border-radius:999px;font-family:'Poppins',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.5px;border:none;cursor:pointer}
  .cancel{background:#eee;color:#444}
  .confirm{background:#0e3a3a;color:#fff}
  </style>
  