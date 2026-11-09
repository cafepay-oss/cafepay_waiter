import store from "./store";
import axios from "axios";

import router from "@/router";
import createRequester from "@/javascripts/request";
import { message } from "ant-design-vue";

const apiRequest = createRequester({
  axios,
  baseURL: () => store.state.baseURL,
  token: () => localStorage.getItem("token"),
  loading: value => { store.state.isLoading = value; },
  failed: () => { store.state.loadWholePage = false; },
  unauthorized: () => {
    localStorage.removeItem("token");
    store.state.userModule.user.token = null;
    if (router.currentRoute.path !== "/login") router.replace("/login").catch(() => {});
  },
  unavailable: () => { message.error("خطا در ارتباط با سرور. لطفا دوباره تلاش کنید"); }
});

const mixin = {
  data() {
    return {
    };
  },
  methods: {
    baseRequest(config) {
      return apiRequest(config, false);
    },

    request(config) {
      return apiRequest(config);
    },
  },
  computed: {
    isLoading() {
      return store.state.isLoading;
    }
  }
};

export default mixin;
