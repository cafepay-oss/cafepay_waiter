import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import mixin from "./mixin";

Vue.mixin(mixin);

import antDesignVue from 'ant-design-vue'

/* Web Socket */
import VueNativeSock from "vue-native-websocket";

Vue.use(VueNativeSock, (process.env.VUE_APP_CAFEPAY_SOCKET_URL || "wss://t.cafepay.app/") + "ws/v1/", {
  connectManually: true,
  store: store,
  reconnection: true,
  reconnectionDelay: 3000
});

/* Styles */
import "ant-design-vue/dist/antd.css";
// import "@/assets/styles/_default-variables.less";
import "@/assets/styles/main.scss";

Vue.use(antDesignVue)

/* QR Code Reader Library */
import VueQrcodeReader from "vue-qrcode-reader";

Vue.use(VueQrcodeReader);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
