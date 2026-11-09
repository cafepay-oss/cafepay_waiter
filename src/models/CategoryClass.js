export default class Category {
  constructor(rawData = {}) {
    this.id = rawData.pk
    this.name = rawData.title
    this.staff = rawData.staff

    this.products = []

  }

  setProducts(products) {
    this.products = products
  }

}
