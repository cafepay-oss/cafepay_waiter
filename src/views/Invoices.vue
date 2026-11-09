<template>
  <a-layout class="invoices">
    <!-- <br>
      <a-row type="flex" justify="space-around" align="top">
          <a-col span="6"><a-button type="primary" icon="printer" size="small"> </a-button>ارسال به آشپزخانه</a-col>
          <a-col span="6"><a-button type="dashed" icon="printer" size="small"> </a-button>ارسال دوباره به آشپزخانه</a-col>
          <a-col span="6"><a-button type="danger" icon="close" size="small"> </a-button>بستن صورتحساب</a-col>
      </a-row>
      <br> -->
    <a-row class="invoices__table" type="flex" justify="center" align="top">
      <a-col span="24">
        <InvoiceTable />
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>
import InvoiceTable from "../components/InvoiceTable";
export default {
  components: {
    InvoiceTable,
  },
};
</script>
