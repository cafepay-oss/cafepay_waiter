<template>
  <a-layout class="tables">
    <a-row type="flex" justify="center">
      <a-col
        :xs="24"
        :sm="24"
        :md="12"
        :lg="8"
        :xl="6"
        v-for="table in tables"
        :key="table.id"
      >
        <TableCard :table="table" @click.native="handleTableClicked(table)" />
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>
import TableCard from "@/components/TableCard.vue";

export default {
  name: "Tables",
  data() {
    return {};
  },
  components: {
    TableCard,
  },
  computed: {
    tables() {
      return this.$store.state.tableModule.tables.filter(tbl => !tbl.isPreorder && !tbl.isMenuOnly);
    },
  },
  methods: {
    handleTableClicked(table) {
      this.$router.push({
        name: "Table",
        params: { tableId: String(table.id) },
      });
    },
  },
};
</script>
