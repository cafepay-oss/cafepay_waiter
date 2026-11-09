import mixin from "../mixin";

export default class Customer {
  constructor(person) {
    this.id = person.user_profile.pk;
    this.fullName = person.user_profile.full_name;
    this.userProfile = person.user_profile.user_profile;
    this.email = person.user_profile.email;
    this.isStaff = person.is_staff;

    this.phoneNumber = null;
    this.image = null;
    this.comments = null;
    this.orders = [];
  }

  getCustomerDate() {
    if (this.privateId) {
      mixin.methods
        .request({
          method: "GET",
          url: "api/v1/user-profile/cafe-private/" + this.privateId + "/"
        })
        .then(res => {
          this.id = res.data.pk;
          this.fullName = res.data.full_name;
          this.email = res.data.email;
          this.phoneNumber = res.phone_number;
          this.image =
            "https://developer.mozilla.org/static/img/favicon144.png";
        })
        .catch(err => {
          this.getCustomerDate();
        });
    } else {
      this.id = null;
      this.fullName = "صندوق دار";
      this.email = null;
      this.phoneNumber = null;
      this.image = "@/assets/cafe-default.png";
    }
  }
}
