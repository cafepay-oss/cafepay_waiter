<template>
  <a-layout class="login">
    <a-row type="flex" justify="center" align="middle">
      <a-col :xs="22" :sm="16" :md="12" :lg="8" :xl="6">
        <div class="text-center login__title">سیستم سفارش گیری کافه پی</div>
        <div class="text-center login__subtitle">مخصوص سالن داران</div>
        <a-form
          id="components-form-demo-normal-login"
          :form="form"
          class="login-form"
          @submit="handleSubmit"
        >
          <transition>
            <a-form-item v-if="state === 'phone-number'">
              <a-input
                class="centered-input"
                size="large"
                type="tel"
                v-model="phoneNumber"
                placeholder="...09"
              >
                <a-icon
                  slot="prefix"
                  type="phone"
                  style="color: rgba(0, 0, 0, 0.25)"
                />
              </a-input>
            </a-form-item>
            <a-form-item v-if="state === 'enter-code'">
              <a-input
                class="centered-input"
                size="large"
                v-model="verificationCode"
                placeholder="12345"
              >
                <a-icon
                  slot="prefix"
                  type="lock"
                  style="color: rgba(0, 0, 0, 0.25)"
                />
              </a-input>
            </a-form-item>
          </transition>
          <a-form-item>
            <a-button
              dir="ltr"
              v-if="state == 'enter-code'"
              :loading="isLoading"
              class="login-form-button"
              @click="changePhoneNumber"
            >
              تغییر شماره تلفن
            </a-button>

            <a-button
              dir="ltr"
              v-if="state == 'enter-code'"
              :loading="isLoading"
              type="primary"
              class="login-form-button"
              @click="verifyCode"
            >
              ورود
            </a-button>

            <a-button
              dir="ltr"
              v-if="state == 'phone-number'"
              :loading="isLoading"
              size="large"
              type="primary"
              class="login-form-button"
              @click="sendPhoneNumber"
            >
              تایید
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      phoneNumber: "",
      verificationCode: "",
      state: "phone-number",
      resendTime: 0,
    };
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "normal_login" });
  },
  computed: {
    testVerificationCode() {
      return this.$store.state.userModule.testVerificationCode;
    },
  },
  methods: {
    sendPhoneNumber() {
      this.state = "enter-code";
      this.$store.dispatch("userModule/sendPhoneNumber", this.phoneNumber);
      this.runTimer();
    },
    verifyCode() {
      this.$store.dispatch("userModule/login", {
        phone_number: this.phoneNumber,
        password: this.verificationCode,
      });
    },
    changePhoneNumber() {
      this.$store.state.errors = [];
      this.state = "phone-number";
    },
    runTimer() {
      this.resendTime = 120;
      let resendTimer = setInterval(() => {
        this.resendTime--;
        if (this.resendTime == 0) clearInterval(resendTimer);
      }, 1000);
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$store.dispatch("userModule/login", values);
        }
      });
    },
  },
  watch: {
    testVerificationCode(newValue, oldValue) {
      if (newValue != "") {
        this.verificationCode = newValue;
        this.$forceUpdate();
      }
    },
  },
};
</script>
