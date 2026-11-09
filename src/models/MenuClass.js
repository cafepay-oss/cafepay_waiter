export default class Menu {
  constructor(rawData = {}) {
    this.id = rawData.pk
    this.name = rawData.name
    this.staff = rawData.staff
    this.isActive = rawData.is_active

    this.categories = []

  }

  setCategories(categories) {
    this.categories = categories
  }

  localUpdateMenu(payload) {
    this.that = JSON.parse(JSON.stringify(this))

    this.name = payload.name
  }

  drawbackLocalUpdate() {
    this.name = this.that.name
  }
}