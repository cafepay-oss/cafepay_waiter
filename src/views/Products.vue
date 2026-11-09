<template>
  <a-layout class="products">
    <a-spin :spinning="isLoading">
      <a-row class="products_table" type="flex" justify="center" align="top">
        <a-col :span="24">
          <!-- <a-input placeholder="نام محصول ...">
              <a-icon slot="prefix" type="search" style="color: rgba(0,0,0,.45)" />
          </a-input> -->
          <span v-if="activeMenu">
            <Category
              v-for="category in activeMenu.categories"
              :key="category.id"
              :category="category"
            />
          </span>
        </a-col>
      </a-row>
    </a-spin>
  </a-layout>
</template>

<script>
import Category from "../components/Category";
export default {
  components: {
    Category,
  },
  computed: {
    activeMenu() {
      let activeMenu = this.$store.state.menuModule.menus.find(
        (menu) => menu.isActive
      );
      if (activeMenu) return activeMenu;
      else if (this.$store.state.menuModule.menus.length > 0)
        return this.$store.state.menuModule.menus[0];
      else return null;
    },
  },
};
</script>
