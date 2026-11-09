import Vue from 'vue'
import Vuex from 'vuex'

import categoryModule from "./category";
import printerModule from "./printer";
import productModule from "./product";
import tableModule from "./table";
import userModule from "./user";
import menuModule from "./menu";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLoading: false,
    baseURL: process.env.VUE_APP_CAFEPAY_BASE_URL || "https://t.cafepay.app/",
    loadWholePageMessage: "",
    loadWholePage: false,

    /* Socket State */
    socket: {
      isConnected: false,
      message: "",
      reconnectError: false
    },

    /* regular expressions */
    tableAggRegExp: new RegExp("table[.](\\d)*[.]aggregate[.]"),
    tableDetailRegExp: new RegExp("table[.](\\d)*[.]join[.]simple[.]by-id[.]")
  },
  mutations: {
    /* socket mutations */
    SOCKET_ONOPEN(state, event) {
      Vue.prototype.$socket = event.currentTarget;
      state.socket.isConnected = true;

      // state.loadWholePageMessage = "در حال بارگزاری ...";
      // setTimeout(() => {
      //   state.loadWholePage = false;
      // }, 2000);

      console.log("socket opened");
      state.tableModule.tables.forEach(table => {
        table.watchTableAggregate();
        table.watchTableDetailData();
      });
      if (state.tableModule.selectedTable) {
        state.tableModule.selectedTable.watchTableDetailData();
      }
    },
    SOCKET_ONCLOSE(state, event) {
      state.socket.isConnected = false;
      console.log("socket closed");
      // state.loadWholePage = true;
      // state.loadWholePageMessage = "در حال اتصال مجدد به سرور";
    },
    SOCKET_ONERROR(state, event) {
      console.log("socket error");
      console.error("Socket connection failed");
    },
    // default handler called for all methods
    SOCKET_ONMESSAGE(state, message) {
      state.socket.message = message;

      message = JSON.parse(message.data);
      console.log(message);

      state.lastUpdate = Date.now();

      if (message.message.status_code == 200) {
        if (message.type == "response") {
          if (state.tableAggRegExp.test(message.message.source)) {
            this.dispatch("tableModule/setTableAggregateData", message.message);
          } else if (state.tableDetailRegExp.test(message.message.source)) {
            this.dispatch("tableModule/setTableDetailData", message.message);
          }
        }
      } else if (message.message.status_code == 404) {
        if (message.type == "response") {
          this.dispatch("tableModule/setTableAggregateData", message.message);
        }
      } else if (message.message.status == 400) {
        let request = {
          request: {
            endpoint:
              "cafe/" +
              state.userModule.activeCafe.id +
              "/tables/join/simple/",
            data: {},
            headers: {
              Authorization: "Token " + state.userModule.user.token
            },
            method: "WATCH"
          }
        };

        let request_str = JSON.stringify(request);
        //console.log(request)
        //Vue.prototype.$socket.send(request_str)
      }
    },
    // mutations for reconnect methods
    SOCKET_RECONNECT(state, count) {
      console.info("Socket reconnect attempt", count);
      console.log("socket reconnected");
      state.loadWholePage = true;
      // if (count == 2) {
      //   Toast.open({
      //     message: "لطفا اتصال سیستم به اینترنت را چک کنید",
      //     type: "is-danger"
      //   });
      // }
    },
    SOCKET_RECONNECT_ERROR(state) {
      state.socket.reconnectError = true;
      console.log("socket reconnected");
    },
  },
  actions: {
    getBasicData: context => {
      if (!context.rootState.userModule.activeCafe || !context.rootState.userModule.activeCafe.id) return;
      context.rootState.tableModule.tablesLoaded = false;
      context.rootState.tableModule.tables = [];
      context.rootState.menuModule.newMenu = false;
      context.rootState.productModule.newProduct = false;
      context.rootState.categoryModule.newCategory = false;
      context.dispatch("userModule/getActiveCafeBasicInfo")
      context.dispatch("productModule/getProducts");
      context.dispatch("categoryModule/getCategories");
      context.dispatch("menuModule/getMenus");
      context.dispatch("tableModule/getTables");
    }
  },
  modules: {
    categoryModule,
    productModule,
    printerModule,
    tableModule,
    userModule,
    menuModule,
  }
})
