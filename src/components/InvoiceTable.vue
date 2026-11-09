<template>
  <a-layout>
    <a-card :bordered="false" title="صورتحساب های فعال">
      <a-table
        :data-source="activeInvoices"
        :pagination="false"
        size="small"
        :rowClassName="
          (row, index) => {
            if (row.colorState == 3) {
              return 'back-green';
            } else if (row.colorState == 0) {
              return 'back-yellow';
            } else if (row.colorState == 1) {
              return 'back-blue';
            } else if (row.colorState == 2) {
              return 'back-red';
            }
          }
        "
      >
        <a-table-column
          key="table"
          title="میز"
          data-index="table.name"
          align="right"
          elipsis="true"
          width="15%"
        />
        <a-table-column
          key="name"
          title="محصولات"
          data-index="paymentInfo.name"
          align="right"
          elipsis="true"
          width="30%"
        />

        <a-table-column
          key="payed"
          title="وضعیت"
          data-index="paymentInfo"
          align="center"
          width="25%"
        >
          <template slot-scope="paymentMethod, record">
            <span>
              {{
                record.paymentState == 0
                  ? " پرداخت کامل"
                  : record.paymentState == 1
                  ? "پرداخت نقدی"
                  : "پرداخت ناقص"
              }}
            </span>
          </template>
        </a-table-column>

        <a-table-column
          key="operation"
          title="عملیات ها"
          data-index="sentToKitchen"
          align="center"
          width="20%"
        >
          <template slot-scope="sentToKitchen, record">
            <a-button-group>
              <a-button
                :type="!record.state ? 'primary' : 'dashed'"
                icon="printer"
                size="small"
                @click="sendOrderKitchen(record.paymentInfo, record.table)"
              >
              </a-button>
              <a-button
                type="danger"
                icon="close"
                size="small"
                @click.prevent="closeInvoice(record.table)"
              >
              </a-button>
            </a-button-group>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </a-layout>
</template>

<script>
import printer from "@/javascripts/printer.js";

export default {
  data() {
    return {
      data: [],
    };
  },
  computed: {
    activeInvoices() {
      let activeInvoices = this.$store.getters["tableModule/activeInvoices"];
      activeInvoices.forEach((invoice) => {
        if (invoice.paymentInfo.netAmount == 0 && invoice.state) {
          invoice.colorState = 3;
        } else if (invoice.paymentInfo.netAmount == 0 && !invoice.state) {
          invoice.colorState = 0;
        } else if (invoice.paymentInfo.netAmount != 0 && !invoice.state) {
          invoice.colorState = 1;
        } else if (invoice.paymentInfo.netAmount != 0 && invoice.state) {
          invoice.colorState = 2;
        }
      });

      // set preffered payment method of invoice
      activeInvoices.forEach((invoice) => {
        invoice.paymentState = 0;

        invoice.products.forEach((product) => {
          product.children.forEach((child) => {
            if (child.netAmount != 0) {
              if (invoice.paymentState < 1) {
                invoice.paymentState = 1;
              }

              if (child.preferredPaymentMethod != "1") {
                if (invoice.paymentState < 2) {
                  invoice.paymentState = 2;
                }
              }
            }
          });
        });
      });

      return activeInvoices.sort((a, b) => a.colorState - b.colorState);
    },
  },
  methods: {
    async sendOrderKitchen(product, table) {
      const orders = table.getTableProducts().filter(order => !order.sentToKitchen);
      const ids = new Set();
      orders.forEach(order => order.children.forEach(child => child.pbrs.forEach(pbr => ids.add(pbr.pbrId))));
      const results = await Promise.all(Array.from(ids, id => this.$store.dispatch("tableModule/sendOrderKitchen", id)));
      if (results.some(result => !result)) return;
      return this.$store.dispatch("printerModule/printOrders", { orders, table, type: "0" });
    },
    closeInvoice(table) {
      this.$store.dispatch("tableModule/closeInvoice", {
        table: table.joinId,
        forceClose: true,
        sent: false,
      });
    },
  },
};
</script>
