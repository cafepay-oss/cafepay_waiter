import store from "../store";
import Vue from "vue";

import Customer from "./CustomerClass";
import Order from "./OrderClass";

import { notification } from "ant-design-vue";

var hash = require("object-hash");
export default class Table {
  constructor(rawData = {}) {
    this.id = rawData.pk;
    this.position = rawData.pk;
    this.name = rawData.number;
    this.staff = rawData.staff;
    this.isPreorder = rawData.is_preorder;
    this.orderType = String(rawData.table_type);

    this.token = null;

    this.paymentInfo = null;
    this.isClosed = null;
    this.forceClose = null;
    this.sent = null;
    this.time = null;
    this.tableType = null;
    this.mergedTablesId = [];
    this.mergedTables = [];
    this.isMenuOnly = this.orderType === "0";

    this.customers = [];
    this.scanned = [];
    this.joinId = null;

    // timer properties
    this.playNotPause = true;
    this.timerInterval = null;
    this.hourlyPrice = 0;
    this.sec = 0;
    this.min = 0;
    this.hour = 0;

    this.that = {};

    this.diffObj = {};
    this.init = false;
  }

  /* socket massages */
  watchTableAggregate() {
    let request = {
      request: {
        endpoint: "table/" + this.id + "/aggregate/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.userModule.user.token
        },
        method: "WATCH"
      }
    };

    let request_str = JSON.stringify(request);

    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  setAggregateDate(payload, free=false) {
    if (free) {
      this.paymentInfo = null;
      this.isClosed = null;
      this.forceClose = null;
      this.sent = null;
      this.time = null;
      this.tableType = null;
      this.mergedTablesId = [];
      this.mergedTables = [];

      this.customers = [];
      this.scanned = [];
      this.joinId = null;

      this.playNotPause = true;
      this.timerInterval = null;
      this.hourlyPrice = 0;
      this.sec = 0;
      this.min = 0;
      this.hour = 0;

      this.init = true;

      this.that = {};

      this.setTableType();
    } else {
      if (this.init) {
        if (!this.paymentInfo) {
          this.diff({}, payload.payment_info);
        } else {
          this.diff(this.paymentInfo, payload.payment_info);
        }
      } else {
        this.init = true;
      }

      this.paymentInfo = payload.payment_info;
      this.isClosed = payload.is_closed;
      this.forceClose = payload.force_close;
      this.sent = payload.sent;
      this.time = new Date(payload.datetime);
      this.mergedTablesId = payload.tables;

      this.findMergedTables();
      this.setTableType();
    }
  }

  diff(currObj = {}, newObj = {}) {
    currObj = currObj || {};
    newObj = newObj || {};
    const keys = new Set([...Object.keys(currObj), ...Object.keys(newObj)]);
    keys.forEach(key => {
      if (currObj[key] === newObj[key] || (currObj[key] !== undefined && newObj[key] !== undefined
        && hash(currObj[key]) === hash(newObj[key]))) return;
      if (currObj[key] && newObj[key] && typeof currObj[key] === "object" && typeof newObj[key] === "object") {
        this.diff(currObj[key], newObj[key]);
      } else {
        this.notificationHandler(key, {
          currValue: currObj[key], newValue: newObj[key],
          type: !Object.prototype.hasOwnProperty.call(newObj, key) ? "deleted"
            : !Object.prototype.hasOwnProperty.call(currObj, key) ? "added" : "changed"
        });
      }
    });
  }
  
  notificationHandler(key, change) {
    let message = "";

    if (key == "total_count") {
      if (this.isPreorder) {} else {

        if (change.type == "changed" || change.type == "added") {
          if (change.newValue - change.currValue > 0) {
            message = `تعداد ${change.newValue - change.currValue} محصول به میز ${
              this.name
            } اضافه شد`;
          } else if (change.newValue - change.currValue < 0) {
            message = `تعداد ${change.currValue - change.newValue} محصول از میز ${
              this.name
            } کم شد`;
          } else {
            message = `یک نفر به میز ${this.name} اضافه شد `
          }
        }
      }
    } else if (key == "net_amount") {
      if (this.isPreorder) {
        if (change.newValue == 0 && change.currValue != 0) {
          message = `یک پیش سفارش آماده بررسی میباشد`;
        }
      } else {
        if (change.newValue == 0 && change.currValue != 0) {
          message = `صورتحساب میز ${this.name} پرداخت شد`;
        } else if (change.newValue == 0 && change.currValue == 0) {
          message = `شخصی به میز ${this.name} اضافه شد`;
        } else if (change.newValue && change.currValue) {
          // message = `تغییری در محصولات میز ${this.name} ایجاد شد`;
        }
      }
    }

    if (message != "") {
      notification.info({
        message: message,
        placement: 'bottomRight',
        duration: 10000,
        style: {
          textAlign: 'right',
          backgroundColor: "#cfffe2"
        },       
      });
      var audio = new Audio(
        "https://proxy.notificationsounds.com/notification-sounds/open-ended-563/download/file-sounds-1100-open-ended.mp3"
      );
      audio.play();
    }
  }

  watchTableDetailData() {
    let request = {
      request: {
        endpoint: "table/" + this.id + "/join/simple/by-id/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.userModule.user.token
        },
        method: "WATCH"
      }
    };

    let request_str = JSON.stringify(request);

    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  setDetailDate(payload) {
    this.scanned = payload.scanned;
    let newCustomers = [];
    this.joinId = payload.pk;
    (payload.bill_products || []).forEach(rawOrder => {
      const productId = typeof rawOrder.product === "object" ? rawOrder.product.id : rawOrder.product;
      const product = store.state.productModule.products.find(item => item.id == productId)
        || { id: productId, name: "محصول حذف‌شده", available: false, original_price: rawOrder.original_price, group: [], images: [] };
      const bill_product = { ...rawOrder, product };
      if (!bill_product.user_profile) {
        const user = store.state.userModule.user;
        bill_product.user_profile = { pk: user.id, full_name: user.fullName, email: user.email };
      }
      let newCustomer = new Customer(bill_product);
      newCustomers.push(newCustomer);
      newCustomer.orders.push(new Order(bill_product));
    });
    this.customers = newCustomers;
  }

  // Get table product-customer data
  getTableProducts() {
    let tableProducts = [];
    let seenProducts = [];

    this.customers.forEach(customer => {
      customer.orders.forEach(order => {
        let relatedSeenProduct = seenProducts.find(
          relatedSeenProduct =>
            relatedSeenProduct.product == order.product.id &&
            relatedSeenProduct.sentToKitchen == order.sentToKitchen
        );

        if (!relatedSeenProduct) {
          seenProducts.push({
            order: order,
            product: order.product.id,
            sentToKitchen: order.sentToKitchen,
            pbrId: order.pbrId
          });
          
          tableProducts.push({
            order: order,
            key: "product-" + order.product.id + "-" + order.sentToKitchen,
            id: order.product.id,
            name: order.product.name,
            number: order.count,
            price: order.paymentInfo.total_amount,
            payed: order.paymentInfo.payed_amount,
            netAmount: order.paymentInfo.net_amount,
            sentToKitchen: order.sentToKitchen,
            pbrId: order.id,
            preferredPaymentMethods: [order.preferredPaymentMethod],
            children: [
              {
                order: order,
                key: "customer-" + customer.id + "-" + customer.isStaff + "-" + order.id,
                userProfile: customer.id,
                isStaff: customer.isStaff,
                id: customer.id,
                name: customer.fullName,
                number: order.count,
                price: order.paymentInfo.total_amount,
                payed: order.paymentInfo.payed_amount,
                netAmount: order.paymentInfo.net_amount,
                pbrs: [{ pbrId: order.id, payment: order.paymentInfo }],
                pbrId: order.id,
                sentToKitchen: 'null',
                preferredPaymentMethod: order.preferredPaymentMethod
              }
            ]
          });
        } else {
          // seen product
          let seenProduct = tableProducts.find(
            child =>
            child.id == order.product.id &&
            child.sentToKitchen == order.sentToKitchen
            );
            seenProduct.number += order.count;
            seenProduct.price += order.paymentInfo.total_amount;
            seenProduct.payed += order.paymentInfo.payed_amount;
            seenProduct.netAmount += order.paymentInfo.net_amount;
            seenProduct.preferredPaymentMethods.push(order.preferredPaymentMethod);
            
            let seenCustomer = seenProduct.children.find(
              child => child.id == customer.id && child.isStaff === customer.isStaff
              );
              
          if (seenCustomer) {
            seenCustomer.number += order.count;
            seenCustomer.price += order.paymentInfo.total_amount;
            seenCustomer.netAmount += order.paymentInfo.net_amount;
            seenCustomer.payed += order.paymentInfo.payed_amount;
            seenCustomer.pbrs.push({
              pbrId: order.id,
              payment: order.paymentInfo
            });
          } else {
            seenProduct.children.push({
              order: order,
              key: "customer-" + customer.id + "-" + customer.isStaff + "-" + order.id,
              userProfile: customer.id,
              isStaff: customer.isStaff,
              id: customer.id,
              name: customer.fullName,
              number: order.count,
              price: order.paymentInfo.total_amount,
              payed: order.paymentInfo.payed_amount,
              netAmount: order.paymentInfo.net_amount,
              pbrs: [{ pbrId: order.id, payment: order.paymentInfo }],
              pbrId: order.id,
              sentToKitchen: 'null',
              preferredPaymentMethod: order.preferredPaymentMethod
            });
          }
        }
      });
    });

    return tableProducts;
  }

  /* set table type method */
  setTableType() {
    const ids = this.mergedTablesId || [];
    if (!ids.length) this.tableType = "free";
    else if (ids.length === 1 || Math.min(...ids.map(table => Number(table.pk))) === Number(this.id)) this.tableType = "fill";
    else this.tableType = "merged";
  }

  /* merged tables methods */
  setMergedTablesId(tablesId) {
    this.mergedTablesId = tablesId;
  }

  findMergedTables() {
    const tables = store.state.tableModule.tables || [];
    this.mergedTables = (this.mergedTablesId || [])
      .map(merged => tables.find(table => table.id == merged.pk))
      .filter(Boolean).sort((left, right) => left.id - right.id);
  }

}
