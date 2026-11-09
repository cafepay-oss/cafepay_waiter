<template>
  <div class="navbar">
    <div class="navbar__user">
      <a-dropdown placement="bottomRight" :trigger="['click']">
        <a-button aria-label="فهرست حساب کاربری">
          <a-icon type="user" />
          {{ user.fullName || "حساب کاربری" }}
        </a-button>
        <a-menu slot="overlay" @click="handleMenuClick">
          <a-menu-item key="1" disabled>{{ user.fullName }}</a-menu-item>
          <a-menu-item key="2">خروج</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {};
  },
  methods: {
    handleMenuClick(e) {
      if (e.key == "2") {
        localStorage.clear();
        this.$router.push("/login");
        this.$message.success({
          content: 'با موفقیت خارج شدید',
          duration: 2,
        });
      }
    },
  },
  computed: {
    user() {
      return this.$store.state.userModule.user;
    },
  },
};
</script>

<style lang="scss" scoped></style>
