import mixin from "@/mixin";

import Table from "@/models/TableClass";

import { message } from "ant-design-vue";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    tables: [],
    tablesLoaded: false,
    cafeTableTokens : [],
    localLoading: 0,
    qrTablesModalVisible: false
  },
  mutations: {
    setTables(state, tablesData) {
      let tables = [];
      tablesData.forEach(table => {
        tables.push(new Table(table));
      });
      
      tables = tables.sort((a, b) => a.id - b.id);
      state.tables = tables;
      state.tablesLoaded = true;
    },
    setEachTableToken(state, payload) {
      state.tables.forEach(table => {
        table.token = null;
      });
      payload.forEach(tableToken => {
        if (tableToken.status == "0") {
          let relatedTable = state.tables.find(
            table => table.id == tableToken.table.pk
          );
          if (relatedTable) {
            relatedTable.token = tableToken.token;
            relatedTable.isMenuOnly = relatedTable.orderType === "0" || Boolean(tableToken.menu_only);
          }
        }
      });
    },
    setCafeTableTokens(state, payload) {
      state.cafeTableTokens = payload;
    },
    /* ---------------- Tables Socket Date Mutations ---------------- */
    setTableAggregateData(state, payload) {
      let tableId = payload.source.match(/(\d)+/g)[0];
    
      let table = (state.tables || []).find(table => table.id == tableId);
    
      if (!table) return;
      if (!payload.data.pk) {
        table.setAggregateDate(payload.data, true);
      } else {
        table.setAggregateDate(payload.data);
      }
    },
    setTableDetailData(state, payload) {
      let tableId = payload.source.match(/(\d)+/g)[0];

      let table = (state.tables || []).find(table => table.id == tableId);

      if (!table) return;
      table.setDetailDate(payload.data);
      state.tableLoading = false;
    },
  },
  actions: {
    /* get tables */
    getTables: context => {
      mixin.methods
      .request({
        method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.userModule.activeCafe.id +
            "/tables/"
        })
        .then(res => {
          context.commit("setTables", res.data);
        })
        .catch(() => {});
    },
    /* ---------------- Tables Socket Date Actions ---------------- */
    setTableAggregateData(context, payload) {
      context.commit("setTableAggregateData", payload);
    },
    setTableDetailData(context, payload) {
      context.commit("setTableDetailData", payload);
    },
    async changeProducts(context, { table, changes }) {
      const add = changes.filter(change => change.count > 0).map(change => ({ ...change }));
      const remove = changes.filter(change => change.count < 0).map(change => ({ ...change, count: -change.count }));
      context.state.localLoading++;
      try {
        return await mixin.methods.request({
          method: "POST",
          url: "api/v1/table/" + table + "/products/change/staff/",
          data: { add, remove }
        });
      } catch (error) {
        message.error("ثبت سفارش انجام نشد. تغییرات شما حفظ شد؛ لطفا دوباره تلاش کنید");
        throw error;
      } finally {
        context.state.localLoading--;
      }
    },
    changeTableToken(context, { token, table }) {
      mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/table-token/" + token + "/activate/",
          data: {
            table: table
          }
        })
        .then(res => {
          context.state.qrTablesModalVisible = false;
          message.success({
            content: 'کد میز با موفقیت تغییر کرد',
            duration: 2
          });
        })
        .catch(err => {
          message.error({
            content: "مشکلی در تغییر کد به وجود آمد",
            duration: 2
          });
        });
    },
    sendOrderKitchen(context, payload) {
      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/pbr/" + payload + "/send-to-kitchen/",
          data: {
            pk: payload,
            sent_to_kitchen: true
          }
        })
        .then(() => true)
        .catch(err => {
          message.error({
            content: "مشکلی در ارسال محصولات به آشپزخانه به وجود آمد",
            duration: 2
          });
          return false;
        });
      },
      closeInvoice(context, { table, forceClose, sent }) {
        mixin.methods
          .request({
            method: "PUT",
            url: "api/v1/join/send/" + table + "/",
            data: {
              force_close: forceClose,
              sent: sent
            }
          })
          .then(res => {
            message.success({
              content: "صورتحساب با موفقیت بسته شد",
              duration: 2
            });
          })
          .catch(err => {
            message.error({
              content: "مشکلی در بستن صورتحساب به وجود آمد",
              duration: 2
            });
          });
      },
      getCafeTableTokens(context) {
        mixin.methods
          .request({
            method: "GET",
            url: "api/v1/cafe/" +
              context.rootState.userModule.activeCafe.id +
              "/table-token/list/"
          })
          .then(res => {
            context.commit("setEachTableToken", res.data);
            context.commit("setCafeTableTokens", res.data);
          })
          .catch(() => {});
      },
  },
  getters: {
    activeInvoices(state) {
      let activeInvoices = []
      
      state.tables.forEach(table => {
        if (table.tableType == 'fill') {
          let invoice = {
            table: table,
            tableProducts: table.getTableProducts()
          };
          activeInvoices.push(invoice);
        }
      });

      let tables = [];

      activeInvoices.forEach((table) => {
        let tableProductSent = [];
        let tableProductReadyToSend = [];

        table.tableProducts.forEach((product) => {
          if (product.sentToKitchen) {
            tableProductSent.push(product);
          } else {
            tableProductReadyToSend.push(product);
          }
        });

        if (tableProductSent.length) {
          tables.push({
            table: table.table,
            state: 1, // sent
            products: tableProductSent,
          });
        }
        if (tableProductReadyToSend.length) {
          tables.push({
            table: table.table,
            state: 0, // ready to send
            products: tableProductReadyToSend,
          });
        }
      });

      tables.forEach(table => {
        let paymentInfo = {
          name: "",
          netAmount: 0,
          number: 0,
          payed: 0,
          pbrId: [],
          price: 0,
        }
        table.products.forEach(product => {
          paymentInfo.name += product.name + " ("+ product.number +") - "
          paymentInfo.netAmount += product.netAmount
          paymentInfo.number += product.number
          paymentInfo.payed += product.payed
          paymentInfo.pbrId.push(product.pbrId)
          paymentInfo.price += product.price
        });
        paymentInfo.name = paymentInfo.name.slice(0, paymentInfo.name.length - 3),
        table.paymentInfo = paymentInfo
      });
      return tables;
    }
  },
}