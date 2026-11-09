<template>
  <a-layout class="stores">
    <a-row type="flex" justify="center" align="middle">
      <a-col :xs="22" :sm="16" :md="12" :lg="8" :xl="6">
        <div class="text-center stores__title">
          {{ $store.state.userModule.cafes.length ? "لطفا فروشگاه خود را انتخاب کنید" : "هیچ فروشگاهی برای این حساب ثبت نشده است" }}
        </div>
        <a-list
          class="stores__stores-list"
          size="small"
          bordered
          :data-source="$store.state.userModule.cafes"
        >
          <a-list-item
            @click="handleStoreClicked(cafe)"
            slot="renderItem"
            slot-scope="cafe, index"
          >
            {{ cafe.name }}
          </a-list-item>
        </a-list>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>
export default {
  name: "Stores",
  data() {
    return {};
  },
  methods: {
    handleStoreClicked(cafe) {
      this.$store.commit("userModule/setActiveCafe", cafe); // set activeCafe
      this.$store.dispatch("userModule/getCafeData");
      this.$router.push("/tables");
    }
  }
};
</script>
