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
          <section class="section">
            <h3>Add-ons</h3>
            <label v-for="a in addOns" :key="a.id" class="option">
              <input type="checkbox" :value="a" v-model="selectedAddOns" />
              {{ a.name }} (+${{ a.price }})
            </label>
          </section>
  
          <!-- Quantity -->
          <section class="section row">
            <h3>Quantity</h3>
            <div class="qty">
              <button @click="qty > 1 && qty--">-</button>
              <span>{{ qty }}</span>
              <button @click="qty++">+</button>
            </div>
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
  import { ref, watch } from 'vue'
  import { useCart } from '../stores/cart'
  
  const props = defineProps({
    item: { type: Object, required: true }
  })
  const cart = useCart()
  const showModal = ref(false)
  const qty = ref(1)
  const selectedVariant = ref(null)
  const selectedAddOns = ref([])
  
  // Reset modal state when opening
  watch(showModal, (isOpen) => {
    if (isOpen) {
      qty.value = 1
      selectedAddOns.value = []
      // Auto-select first size if available
      selectedVariant.value = props.item.sizes && props.item.sizes.length > 0 ? props.item.sizes[0] : null
    }
  })
  
  // sample add-ons
  const addOns = [
    { id: 'raita', name: 'Raita', price: 2 },
    { id: 'extra-chicken', name: 'Extra Chicken', price: 4 }
  ]
  function confirmAdd() {
  const addOnsTotal = selectedAddOns.value.reduce((t, a) => t + a.price, 0)
  // Use size price if selected, otherwise use base item price
  const basePrice = selectedVariant.value ? Number(selectedVariant.value.price) : props.item.price
  
  cart.add({
    id: props.item.id,
    name: props.item.name,
    image: props.item.image,  
    price: basePrice + addOnsTotal,
    variant: selectedVariant.value,
    addOns: selectedAddOns.value,
    qty: qty.value
  })
  showModal.value = false
}
  </script>
  
  <style scoped>
  /* existing card styles */
  .card{background:#f9f7f2;border-radius:16px;padding:12px;box-shadow:0 4px 14px rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.05);margin-bottom:14px}
  .photo{width:100%;height:170px;object-fit:cover;border-radius:12px}
  .row{display:flex;align-items:center;justify-content:space-between}
  .head{margin-top:10px}
  .name{margin:0;font-weight:800;color:#153c3c;font-size:clamp(18px,4.5vw,22px)}
  .price{font-weight:800;color:#153c3c;font-size:16px}
  .desc{margin:6px 0 8px;color:#425e5e;font-size:14px;line-height:1.3}
  .foot{margin-top:6px}
  .badges{display:flex;gap:8px;align-items:center}
  .badge{padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;color:#1b5a3d;background:#e6f2ea;border:1px solid #d5e8de}
  .add{margin-left:auto;background:#0e3a3a;color:#fff;font-weight:800;letter-spacing:.5px;border:0;border-radius:999px;padding:10px 16px;min-width:84px;box-shadow:0 6px 14px rgba(0,0,0,.15);transition:transform .06s ease, background .2s ease}
  .add:active{transform:scale(.98)}
  .add:hover{background:#0c3030}
  
  /* modal styles */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;z-index:50}
  .modal{background:#fff;width:100%;max-width:500px;border-radius:20px 20px 0 0;padding:20px;max-height:90vh;overflow-y:auto;animation:slideUp .3s ease}
  @keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
  .title{margin:0 0 12px;font-size:20px;font-weight:700;text-align:center}
  .section{margin:16px 0}
  .section h3{margin:0 0 8px;font-size:16px;font-weight:600}
  .option{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:14px}
  .qty{display:flex;align-items:center;gap:14px;font-size:16px;font-weight:700}
  .qty button{width:32px;height:32px;border-radius:50%;border:none;background:#eee;font-weight:700;font-size:16px}
  .actions{display:flex;justify-content:space-between;margin-top:20px;gap:10px}
  .cancel,.confirm{flex:1;padding:12px;border-radius:999px;font-weight:700;border:none;cursor:pointer}
  .cancel{background:#eee;color:#444}
  .confirm{background:#0e3a3a;color:#fff}
  </style>
  