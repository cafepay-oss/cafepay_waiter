export default class Cafe {
  constructor(rawData = {}) {
    this.id = rawData.pk ? rawData.pk : rawData.id; // :)))
    this.name = rawData.name

    this.address = ''
    this.location = ''
    this.description = ''

    this.offPercent = 0
    
    this.cafepayFee = 0
    this.feePayer = null

    this.images = ''
    this.activeHours = ''
    this.CEO = ''


    this.waiters = []

    this.that = {}
  }

  setAddress(address) {
    this.address = address
    return this
  }

  setLocation(location) {
    this.location = location
    return this
  }

  setDescription(description) {
    this.description = description
    return this
  }

  setOffPercent(offPercent) {
    this.offPercent = offPercent
    return this
  }

  setBasicInfo(data) {
    this.id = data.pk
    this.name = data.name
    this.description = data.description
    this.location = data.location
    this.address = data.address
    this.cafepayFee = data.cafepay_fee
    this.feePayer = data.fee_payer
    return this
  }

  localUpdateCafe(payload) {
    this.that = JSON.parse(JSON.stringify(this))

    this.name = payload.name
    this.address = payload.address
    this.location = payload.location
    this.offPercent = payload.offPercent
    this.description = payload.description
    this.activeHours = payload.activeHours
  }

  localDrawbackUpdate() {
    this.name = this.that.name
    this.address = this.that.address
    this.location = this.that.location
    this.offPercent = this.that.offPercent
    this.description = this.that.description
    this.activeHours = this.that.activeHours
  }
}
