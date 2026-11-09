<template>
  <a-card :bordered="false" :title="category.name">
    <a-table :data-source="filteredProducts" :pagination="false" size="small">
      <a-table-column
        key="name"
        title="نام محصول"
        data-index="name"
        align="right"
        elipsis="true"
        width="250px"
      />
      <a-table-column
        key="original_price"
        title="قیمت (تومان)"
        data-index="original_price"
        align="center"
      >
        <template slot-scope="original_price, record">
          <span v-if="record.discount > 0">
            <strike> {{ original_price }} </strike>
            <span> - {{ original_price * (1 - record.discount / 100) }}</span>
          </span>
          <span v-else> {{ original_price }} </span>
        </template>
      </a-table-column>
      <a-table-column
        key="discount"
        title="تخفیف"
        data-index="discount"
        align="center"
      >
        <template slot-scope="discount">
          <span> {{ discount }}% </span>
        </template>
      </a-table-column>
      <a-table-column
        key="count"
        title="تعداد"
        data-index="count"
        align="center"
      />
      <a-table-column
        key="available"
        title="وضعیت"
        data-index="available"
        align="center"
      >
        <template slot-scope="available, record">
          <a-switch
            :loading="isLoading"
            v-model="available"
            size="small"
            @change="sendAvailablity(record)"
          />
        </template>
      </a-table-column>
    </a-table>
  </a-card>
</template>

<script>
export default {
  props: ["category"],
  data() {
    return {};
  },
  methods: {
    sendAvailablity(product) {
      this.$store.dispatch("productModule/changeAvailablity", product);
    },
  },
  computed: {
    filteredProducts() {
      return this.category.products.filter(product => !product.deleted)
    }
  }
};
</script>
