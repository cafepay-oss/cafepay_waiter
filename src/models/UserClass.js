export default class User {
  constructor(rawData = {}) {
    this.id = rawData.pk
    this.fullName = rawData.full_name
    this.email = rawData.email
    this.nationalCode = rawData.national_code
    this.phone_number = rawData.phone_number

    this.hasUsablePassword = rawData.has_usable_password

    this.verificationStatus = rawData.verification_status

    this.staff = ''

    this.token = rawData.token
    
    this.level = ''

    this.permissions = []

  }
  
  setPermissions (permissions){
    this.permissions = permissions
  }

  havePermission (permission){
    return this.permissions.includes(permission)
  }

  getToken (){
    return this.token
  }

}
