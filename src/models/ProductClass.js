export default class Product {
  constructor(rawData = {}) {
    this.id = rawData.pk;
    this.name = rawData.name;
    this.available = rawData.available;
    this.description = rawData.description;
    this.discount = rawData.discount;
    this.original_price = rawData.original_price;
    this.overallRating = rawData.overallRating;
    this.category = rawData.category;
    this.count = rawData.count;

    this.images = rawData.images;
    this.deleted = rawData.is_delete;

    this.that = {};
  }

  localUpdateProduct(payload) {
    this.that = JSON.parse(JSON.stringify(this));

    this.name = payload.name;
    this.original_price = payload.original_price;
    this.discount = payload.discount;
    this.description = payload.description;
    this.category = payload.category;
    this.count = payload.count;
  }

  drawbackLocalUpdate() {
    this.name = this.that.name;
    this.original_price = this.that.original_price;
    this.discount = this.that.discount;
    this.description = this.that.description;
    this.category = this.that.category;
    this.count = this.that.count;
  }
}
