<template>
  <div class="table" v-if="table">
    <div class="table__menu">
      <a-row class="table__menu__categories">
        <a-tag
          class="table__menu__categories__category"
          :color="selectedCategory && selectedCategory.id == category.id ? '#108ee9' : '#2db7f5'"
          v-for="category in categories"
          :key="category.id"
          @click="handleCategoryClicked(category)"
        >
          {{ category.name }}
        </a-tag>
      </a-row>
    </div>

    <p v-if="!categories.length" class="text-center">منوی فعالی برای این فروشگاه ثبت نشده است</p>
    <a-row type="flex" justify="center" class="table__menu__products">
      <a-col
        :xs="24"
        :sm="24"
        :md="12"
        :lg="8"
        :xl="6"
        v-for="product in categoryProducts"
        :key="product.id"
      >
        <ProductCard :product="product" @click.native="addOrder(product)" />
      </a-col>
    </a-row>
    <a-row>
      <a-col>
        <a-table
          class="table__menu__table-products"
          size="small"
          :scroll="{ y: 100, x: 900 }"
          :data-source="tableOrders.concat(newOrders)"
          :row-key="record => record.key"
          :pagination="false"
        >
          <a-table-column
            key="name"
            title="محصولات"
            data-index="name"
            align="right"
            width="180px"
          />
          <a-table-column
            key="number"
            title="تعداد"
            data-index="number"
            align="center"
            width="80px"
          />
          <a-table-column
            key="price"
            title="مبلغ"
            data-index="price"
            align="center"
            width="100px"
          />
          <a-table-column
            key="payed"
            title="پرداختی"
            data-index="payed"
            align="center"
            width="100px"
          />
          <a-table-column
            key="netAmount"
            title="باقی مانده"
            data-index="netAmount"
            align="center"
            width="120px"
          />

          <a-table-column key="decrease" width="100px" title="کم کردن">
            <template slot-scope="decrease, record">
              <a-button
                type="danger"
                shape="circle"
                icon="minus"
                size="small"
                align="center"
                :disabled="submitting"
                @click="removeOrder(record)"
              />
            </template>
          </a-table-column>

          <a-table-column key="edit" title="توضیحات" width="120px">
            <template slot-scope="edit, record">
              <a>ویرایش</a>
            </template>
          </a-table-column>

          <a-table-column
            key="sentToKitchen"
            title="وضعیت"
            align="center"
            width="100px"
          >
            <template slot-scope="sentToKitchen, record">
              <span v-if="record.sentToKitchen == 'null'"></span>
              <span v-if="record.sentToKitchen == true">آشپزخانه</span>
              <span v-if="!record.sentToKitchen && !record.isDraft" dir="ltr">
                <a-checkbox
                  :checked="isChecked(record)"
                  @change="handleChangeSendOrderToKitchenPBRs(record)"
                >
                  ارسال
                </a-checkbox>
              </span>
            </template>
          </a-table-column>
        </a-table>
      </a-col>
    </a-row>
    <a-row type="flex" align="middle">
      <a-col :span="24">
        <a-button-group class="table__actions">
        <a-button type="primary" class="table__actions__send-kitchen height-100 text-center table__actions__item" :loading="sendingKitchen" :disabled="submitting || changes.length > 0 || !sendOrderToKitchenPBRs.length" @click="sendOrderToKitchen()">
          ارسال به آشپزخانه
        </a-button>
        <a-button type="primary" class="table__actions__print-invoice height-100 text-center table__actions__item" :loading="printing" :disabled="submitting || changes.length > 0" @click="print()">
          چاپ صورتحساب
        </a-button>
        <a-button v-if="false" type="primary" class="table__actions__close-invoice height-100 text-center table__actions__item">
          پرداخت صورتحساب
        </a-button>
        <a-button type="primary" class="table__actions__close-invoice height-100 text-center table__actions__item" @click.prevent="closeInvoice()">
          بستن صورتحساب
        </a-button>
        <a-button :disabled="changes.length == 0 || submitting" :loading="submitting" type="primary" class="table__actions__submit-order height-100 text-center table__actions__item" @click="sendBulkData()">
          ثبت سفارش
        </a-button>
        </a-button-group>
        </a-col>
    </a-row>
  </div>
  <div v-else class="table text-center">
    {{ $store.state.tableModule.tablesLoaded ? "میز مورد نظر پیدا نشد" : "در حال دریافت اطلاعات میز" }}
    <router-link to="/tables">بازگشت به میزها</router-link>
  </div>
</template>

<script>
import ProductCard from "@/components/ProductCard.vue";
export default {
  name: "Table",
  components: {
    ProductCard,
  },
  data() {
    return {
      submitting: false,
      sendingKitchen: false,
      printing: false,
      newOrders: [],
      changes: [],

      tableOrders: [],

      selectedCategory: null,
      sendOrderToKitchenPBRs: [],
    };
  },
  props: {
    tableId: {
      type: String,
      required: true,
    },
  },
  computed: {
    table() {
      return this.$store.state.tableModule.tables.find(table => String(table.id) === String(this.tableId));
    },
    categories() {
      return this.activeMenu ? this.activeMenu.categories : [];
    },
    categoryProducts() {
      return this.selectedCategory ? this.selectedCategory.products.filter(Boolean) : [];
    },
    activeMenu() {
      return this.$store.state.menuModule.menus.find((menu) => menu.isActive);
    },
    tableProducts() {
      return this.table ? this.table.getTableProducts().sort((a, b) => a.id - b.id) : [];
    },
  },
  methods: {
    handleChangeSendOrderToKitchenPBRs(record) {
      let relatedRecord = this.sendOrderToKitchenPBRs.find(
        (pbr) => pbr == record
      );
      if (relatedRecord) {
        this.sendOrderToKitchenPBRs = this.sendOrderToKitchenPBRs.filter(
          (pbr) => pbr != record
        );
      } else {
        this.sendOrderToKitchenPBRs.push(record);
      }
    },
    async sendOrderToKitchen() {
      if (this.sendingKitchen || this.submitting || this.changes.length) return false;
      const orders = this.sendOrderToKitchenPBRs.slice();
      if (!orders.length) return false;
      this.sendingKitchen = true;
      try {
        const ids = new Set();
        orders.forEach(order => (order.children || []).forEach(item =>
          item.pbrs.forEach(pbr => ids.add(pbr.pbrId))));
        const results = await Promise.all(Array.from(ids, id => this.$store.dispatch("tableModule/sendOrderKitchen", id)));
        if (results.some(result => !result)) return false;
        this.sendOrderToKitchenPBRs = [];
        await this.$store.dispatch("printerModule/printOrders", { orders, table: this.table, type: "0" });
        return true;
      } finally {
        this.sendingKitchen = false;
      }
    },
    async print() {
      if (this.printing || this.submitting || this.changes.length) return false;
      this.printing = true;
      try {
        return await this.$store.dispatch("printerModule/printOrders", {
          orders: this.tableProducts, table: this.table, type: "1"
        });
      } finally {
        this.printing = false;
      }
    },
    closeInvoice() {
      this.$store.dispatch("tableModule/closeInvoice", {
        table: this.table.joinId,
        forceClose: true,
        sent: false,
      });
    },
    isChecked(record) {
      return this.sendOrderToKitchenPBRs.includes(record);
    },
    handleCategoryClicked(category) {
      this.selectedCategory = category;
    },
    addOrder(product) {
      if (this.submitting || !product.available) return;
      const existing = this.newOrders.find(order => order.id === product.id);
      if (existing) {
        existing.number++;
        existing.price += product.original_price;
        existing.netAmount = existing.price;
      } else {
        this.newOrders.push({
          key: "draft-" + product.id, id: product.id, name: product.name,
          number: 1, price: product.original_price, payed: 0,
          netAmount: product.original_price, sentToKitchen: false, isDraft: true
        });
      }
      const change = this.changes.find(item => item.product === product.id && item.count > 0);
      if (change) change.count++;
      else this.changes.push({ product: product.id, count: 1 });
    },
    removeOrder(record) {
      if (this.submitting) return;
      if (record.isDraft) {
        const change = this.changes.find(item => item.product === record.id && item.count > 0);
        if (!change) return;
        change.count--;
        this.changes = this.changes.filter(item => item.count !== 0);
        const unit = record.price / record.number;
        record.number--;
        record.price -= unit;
        record.netAmount = record.price;
        this.newOrders = this.newOrders.filter(item => item.number > 0);
        return;
      }
      const child = record.children
        ? record.children.find(item => item.number > 0 && item.netAmount >= item.price / item.number)
        : record;
      if (!child || !child.number || child.userProfile == null) return;
      const parent = this.tableOrders.find(item => item.children && item.children.includes(child));
      if (!parent) return;
      const product = parent.id;
      const unit = child.price / child.number;
      if (child.netAmount < unit) return;
      const change = this.changes.find(item => item.product === product && item.count < 0
        && item.user_profile === child.userProfile && item.is_staff === child.isStaff);
      if (change) change.count--;
      else this.changes.push({ product, count: -1, user_profile: child.userProfile, is_staff: child.isStaff });
      child.number--;
      child.price -= unit;
      child.netAmount = child.price - child.payed;
      parent.number--;
      parent.price -= unit;
      parent.netAmount = parent.price - parent.payed;
      parent.children = parent.children.filter(item => item.number > 0);
      this.tableOrders = this.tableOrders.filter(item => item.number > 0);
    },
    async sendBulkData() {
      if (this.submitting || !this.changes.length || !this.table) return false;
      this.submitting = true;
      const table = this.table;
      const changes = this.changes.map(change => ({ ...change }));
      try {
        const response = await this.$store.dispatch("tableModule/changeProducts", { table: table.id, changes });
        table.setDetailDate(response.data);
        this.changes = [];
        this.newOrders = [];
        this.sendOrderToKitchenPBRs = [];
        this.tableOrders = table.getTableProducts();
        return true;
      } catch (error) {
        return false;
      } finally {
        this.submitting = false;
      }
    },
    
  },
  watch: {
    categories: {
      immediate: true,
      handler(categories) {
        this.selectedCategory = categories.find(category => this.selectedCategory && category.id === this.selectedCategory.id)
          || categories[0] || null;
      }
    },
    tableProducts: {
      immediate: true,
      deep: true,
      handler(products) {
        if (!this.changes.length) this.tableOrders = products;
      }
    },
    tableId() {
      this.changes = [];
      this.newOrders = [];
      this.tableOrders = this.tableProducts;
      this.sendOrderToKitchenPBRs = [];
    }
  },
};
</script>
