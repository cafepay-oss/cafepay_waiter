export default class Order {
  constructor(rawData = {}) {
    this.id = rawData.pk;
    this.product = rawData.product;
    this.count = rawData.count;
    this.discount = rawData.discount;
    this.originalPrice = rawData.original_price;
    this.isStaff = rawData.is_staff;
    this.unitAmount = rawData.unit_amount;
    this.paymentInfo = rawData.payment_info;
    this.privateId = rawData.private_id;
    this.pbrId = rawData.private_id;
    this.sentToKitchen = rawData.sent_to_kitchen;
    this.preferredPaymentMethod = rawData.preferred_payment_method;
    this.that = {};
  }

  updateOrder(payload) {
    this.count = payload.count;
    this.discount = payload.discount;
    this.paymentInfo = payload.payment_info;
  }
}
