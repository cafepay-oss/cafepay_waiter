<template>
  <a-card class="product-card">
    <p class="one-line-text">{{ product.name }}</p>
  </a-card>
</template>

<script>
export default {
  name: "ProductCard",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
</style>