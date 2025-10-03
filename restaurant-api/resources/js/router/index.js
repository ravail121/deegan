import { createRouter, createWebHistory } from 'vue-router'

const Welcome = () => import('../pages/Welcome.vue')
const Menu = () => import('../pages/Menu.vue')
const Checkout = () => import('../pages/Checkout.vue')


export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',     name: 'welcome', component: Welcome },
    { path: '/menu', name: 'menu',    component: Menu },
    { path: '/checkout', name: 'checkout', component: Checkout }
  ],
  scrollBehavior: () => ({ top: 0 })
})
