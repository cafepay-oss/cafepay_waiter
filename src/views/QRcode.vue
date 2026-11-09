<template>
  <div class="qrcode">
    <qrcode-stream @decode="onDecode"></qrcode-stream>
    <a-modal
      v-model="$store.state.tableModule.qrTablesModalVisible"
      :title="tableCode + ' کد'"
      @ok="handleOk"
    >
      <h4>لطفا میز مورد نظر را انتخاب کنید.</h4>
      <a-list
        class="qrcode__tables-list"
        size="small"
        bordered
        :data-source="tables"
      >
        <a-list-item
          :class="{ selected: selectedTable.id == table.id }"
          @click="handleTableClicked(table)"
          slot="renderItem"
          slot-scope="table, index"
        >
          {{ table.name }}
        </a-list-item>
      </a-list>
      <template slot="footer">
        <a-button key="back" @click="handleCancel"> بازگشت </a-button>
        <a-button
          key="submit"
          type="primary"
          :loading="isLoading"
          @click="handleOk"
        >
          ثبت
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: "qr-code",
  data() {
    return {
      tableCode: "",
      selectedTable: {},
    };
  },
  methods: {
    onDecode(decodedString) {
      if (typeof decodedString == "string") {
        this.tableCode = decodedString.split("?token=")[1];
        this.$store.state.tableModule.qrTablesModalVisible = true;
      }
    },
    handleTableClicked(table) {
      this.selectedTable = table;
    },
    handleOk(e) {
      this.$store.dispatch("tableModule/changeTableToken", {
        table: this.selectedTable.id,
        token: this.tableCode,
      });
    },
  },
  computed: {
    tables() {
      return this.$store.state.tableModule.tables;
    },
  },
};
</script>
