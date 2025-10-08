import { defineStore } from 'pinia'

export const useCart = defineStore('cart', {
  state: () => {
    // Load cart from localStorage on state initialization
    let initialItems = []
    try {
      const savedCart = localStorage.getItem('deegan-cart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        initialItems = parsedCart.items || []
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      initialItems = []
    }
    
    return {
      items: initialItems // each: { id, name, price, qty }
    }
  },
  getters: {
    count: (s) => s.items.reduce((n, i) => n + i.qty, 0),
    total: (s) => s.items.reduce((n, i) => n + (i.price * i.qty), 0)
  },
  actions: {
    // Helper function to save cart to localStorage
    saveToStorage() {
      try {
        localStorage.setItem('deegan-cart', JSON.stringify({
          items: this.items,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    },
    
    add(item) {
      const line = this.items.find(i =>
        i.id === item.id &&
        item.variant?.sizeID === i.variant?.sizeID
      )
      if (line) {
        line.qty += item.qty
      } else {
        this.items.push({ ...item })
      }
      this.saveToStorage()
    },
    
    inc(idx){ 
      this.items[idx].qty++
      this.saveToStorage()
    },
    
    dec(idx){
      const it = this.items[idx]
      if (!it) return
      if (it.qty > 1) it.qty--
      this.saveToStorage()
    },
    
    remove(idx){
      this.items.splice(idx, 1)
      this.saveToStorage()
    },
    
    updateNotes(idx, notes) {
      if (this.items[idx]) {
        this.items[idx].notes = notes
        this.saveToStorage()
      }
    },
    
    clearCart(){
      this.items = []
      this.saveToStorage()
    }
  }
})
