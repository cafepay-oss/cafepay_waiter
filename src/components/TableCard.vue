<template>
  <a-card class="table-card" :class="backgroundColor">
    <h3 class="table-card__table-name">میز {{ table.name }}</h3>
    <span class="table-card__table-data" v-if="table.paymentInfo">
      <p><span>تعداد سفارشات</span>: {{table.paymentInfo.total_count}} عدد</p>
      <p><span>مبلغ کل</span>: {{table.paymentInfo.total_amount}} تومان</p>
      <p><span>پرداخت شده</span>: {{table.paymentInfo.net_payed_amount}} تومان</p>
      <p><span>مانده</span>: {{table.paymentInfo.net_amount}} تومان</p>
    </span>
  </a-card>
</template>

<script>
export default {
  name: "TableCard",
  props: {
    table: {
      type: Object,
      required: true,
    },
  },
  computed: {
    backgroundColor() {
      if (this.table.paymentInfo) {
        
        if (this.table.paymentInfo.net_amount == 0) {
          let color = 'back-green';
          this.table.customers.forEach(customer => {
            customer.orders.forEach(order => {
              if (!order.sentToKitchen) {
                color = 'back-yellow'
              }
            });
          });
          return color
        } else {
          let color = 'back-blue';
          this.table.customers.forEach(customer => {
            customer.orders.forEach(order => {
              if (order.sentToKitchen && order.paymentInfo.net_amount != 0) {
                color = 'back-red'
              }
            });
          });
          return color
        }
      }
    return ''
    }
  }
};
</script>