<template>
  <div id="app" dir="rtl">
    <div class="body">
      <Navbar v-if="asideAnable()" />
      <router-view class="app-body" />
      <aside-menu :menu="menu" v-if="asideAnable()" />
    </div>
  </div>
</template>

<script>
import sidebarMenu from "@/javascripts/sidebarMenu.js";
import AsideMenu from "@/components/AsideMenu";
import Navbar from "@/components/Navbar";
import Vue from "vue";

export default {
  data() {
    return {};
  },
  components: {
    AsideMenu,
    Navbar,
  },
  mounted() {
    let token = localStorage.getItem("token");
    if (token) {
      this.$store.dispatch("userModule/getUserCafeRelations");
      this.$store.commit("userModule/setToken", token);
    } else {
      this.$router.replace("/login").catch(() => {});
    }
  },
  methods: {
    asideAnable() {
      if (this.$router.history.current.path != "/login") {
        return true;
      }
    },
  },
  computed: {
    menu() {
      let menu = sidebarMenu.sidebarMenu.slice();
      if (this.$store.state.userModule.cafes.length > 1) {
        menu.push({
          key: 5,
          to: "/stores",
          icon: "shop",
          label: "فروشگاه های من",
        });
      }
      return menu
    },
    activeCafe() {
      return this.$store.state.userModule.activeCafe;
    },
    tables() {
      return this.$store.state.tableModule.tables;
    },
    socketReady() {
      return Boolean(this.activeCafe && this.activeCafe.id && this.$store.state.tableModule.tablesLoaded && this.fillProducts);
    },
    fillProducts() {
      return (
        this.$store.state.productModule.newProduct &&
        this.$store.state.categoryModule.newCategory
      );
    },
    fillCategories() {
      return (
        this.$store.state.categoryModule.newCategory &&
        this.$store.state.menuModule.newMenu
      );
    },
  },
  watch: {
    activeCafe(newValue) {
      if (newValue && newValue.id) {
        Vue.prototype.$disconnect();
        // this.$store.state.loadWholePage = true;
        this.$store.dispatch("getBasicData");
      }
    },
    tables(newValue) {
      if (newValue.length && this.activeCafe) {
        this.$store.dispatch("tableModule/getCafeTableTokens");
      }
    },
    socketReady(ready) {
      if (ready) Vue.prototype.$connect();
      else Vue.prototype.$disconnect();
    },
    fillProducts(newValue) {
      if (newValue) {
        this.$store.dispatch("categoryModule/fillProducts");
      }
    },
    fillCategories(newValue) {
      if (newValue) {
        this.$store.dispatch("menuModule/fillCategories");
      }
    },
  },
};
</script>
