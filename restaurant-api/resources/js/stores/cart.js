import { defineStore } from 'pinia'

export const useCart = defineStore('cart', {
  state: () => ({
    items: [] // each: { id, name, price, qty }
  }),
  getters: {
    count: (s) => s.items.reduce((n, i) => n + i.qty, 0),
    total: (s) => s.items.reduce((n, i) => n + (i.price * i.qty), 0)
  },
  actions: {
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
    },
    inc(idx){ this.items[idx].qty++ },
    dec(idx){
        const it = this.items[idx]
        if (!it) return
        if (it.qty > 1) it.qty--
      },
  remove(idx){
    this.items.splice(idx, 1)
  },
  clearCart(){
    this.items = []
  }
  }
})
