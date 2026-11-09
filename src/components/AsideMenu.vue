<template>
  <a-menu
    class="action-bar"
    :default-selected-keys="[1]"
    mode="inline"
    theme="dark"
    inline-collapsed
  >
    <template v-for="item in menu">
      <a-menu-item :key="item.key" :title="item.label" :aria-label="item.label" @click="handleMenuItemClicked(item)"
        ><a-icon :type="item.icon" />
      </a-menu-item>
    </template>
    <!-- <template>
      <a-menu-item @click="handleLogout()"
        ><a-icon type="poweroff" />
      </a-menu-item>
    </template> -->
  </a-menu>
</template>

<script>
export default {
  name: "AsideMenu",
  components: {},
  props: {
    menu: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleMenuItemClicked(item) {
      if (this.$route.path !== item.to) this.$router.push(item.to);
    },
    handleLogout() {
      localStorage.removeItem('token')
      this.$router.push('/login')
    }
  },
};
</script>
