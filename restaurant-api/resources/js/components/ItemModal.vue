<template>
    <div class="overlay" v-if="open">
      <div class="modal">
        <!-- Header -->
        <h2 class="title">{{ item?.name }}</h2>
        <img v-if="item?.image" :src="item.image" :alt="item.name" class="photo" />
  
        <!-- Variants -->
        <section class="section">
          <h3>Choose Size</h3>
          <label v-for="v in item.variants" :key="v.id" class="option">
            <input type="radio" name="variant" :value="v" v-model="selectedVariant" />
            {{ v.name }} (+${{ v.price }})
          </label>
        </section>
  
        <!-- Add-ons -->
        <section class="section">
          <h3>Add-ons</h3>
          <label v-for="a in item.addOns" :key="a.id" class="option">
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
          <button class="cancel" @click="$emit('close')">Cancel</button>
          <button class="confirm" @click="confirmAdd">Add to Cart</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    open: Boolean,
    item: Object
  })
  const emit = defineEmits(['close', 'add'])
  
  const selectedVariant = ref(null)
  const selectedAddOns = ref([])
  const qty = ref(1)
  
  watch(() => props.open, (val) => {
    if (val) {
      qty.value = 1
      selectedVariant.value = props.item?.variants?.[0] || null
      selectedAddOns.value = []
    }
  })
  
  function confirmAdd() {
    emit('add', {
      ...props.item,
      variant: selectedVariant.value,
      addOns: selectedAddOns.value,
      qty: qty.value
    })
    emit('close')
  }
  </script>
  
  <style scoped>
  .overlay{
    position:fixed;inset:0;background:rgba(0,0,0,.55);
    display:flex;align-items:flex-end;justify-content:center;
    z-index:50;
  }
  .modal{
    background:#fff;color:#222;width:100%;max-width:500px;
    border-radius:20px 20px 0 0;padding:20px;max-height:90vh;
    overflow-y:auto;animation:slideUp .3s ease;
  }
  @keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
  
  .title{margin:0 0 12px;font-size:20px;font-weight:700;text-align:center}
  .photo{width:100%;height:160px;object-fit:cover;border-radius:12px;margin-bottom:14px}
  
  .section{margin:16px 0}
  .section h3{margin:0 0 8px;font-size:16px;font-weight:600}
  .option{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:14px}
  
  .row{display:flex;align-items:center;justify-content:space-between}
  .qty{display:flex;align-items:center;gap:14px;font-size:16px;font-weight:700}
  .qty button{width:32px;height:32px;border-radius:50%;border:none;background:#eee;font-weight:700;font-size:16px}
  
  .actions{display:flex;justify-content:space-between;margin-top:20px;gap:10px}
  .cancel,.confirm{flex:1;padding:12px;border-radius:999px;font-weight:700;border:none;cursor:pointer}
  .cancel{background:#eee;color:#444}
  .confirm{background:#0e3a3a;color:#fff}
  </style>
  