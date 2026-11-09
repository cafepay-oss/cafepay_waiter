import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const routes = [
  { path: "/", redirect: "/tables" },
  { path: "/table", redirect: "/tables" },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/stores',
    name: 'Stores',
    component: () => import(/* webpackChunkName: "Stores" */ '../views/Stores.vue')
  },
  {
    path: '/tables',
    name: 'Tables',
    component: () => import(/* webpackChunkName: "Tables" */ '../views/Tables.vue')
  },
  {
    path: "/table/:tableId",
    name: "Table",
    component: () =>
      import(/* webpackChunkName: "Table" */ "../views/Table.vue"),
    props: true
  },
  {
    path: "/qrcode",
    name: "QRcode",
    component: () =>
      import(/* webpackChunkName: "QRcode" */ "../views/QRcode.vue"),
    props: true
  },
  {
    path: "/products",
    name: "Products",
    component: () => import(/* webpackChunkName: "Products" */ "../views/Products.vue"),
  },
  {
    path: "/invoices",
    name: "Invoices",
    component: () => import(/* webpackChunkName: "Invoices" */ "../views/Invoices.vue"),
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
