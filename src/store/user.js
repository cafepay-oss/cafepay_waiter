import mixin from "@/mixin";
import router from "@/router";

import { message } from "ant-design-vue";

import Cafe from "@/models/CafeClass";
import User from "@/models/UserClass";

function savedCafe() {
  try {
    const cafe = JSON.parse(localStorage.getItem("activeCafe"));
    return cafe && cafe.id ? new Cafe(cafe) : null;
  } catch (error) {
    localStorage.removeItem("activeCafe");
    return null;
  }
}

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    user: {}, // loged in user

    cafes: [], // list of cafes that user work in
    activeCafe: savedCafe(),

    testVerificationCode: ''
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    setToken(state, token) {
      state.user.token = token;
      localStorage.setItem("token", token);
    },
    setCafesData(state, payload) {
      let cafes = [];

      payload.forEach((cafeRelation) => {
        cafes.push(new Cafe(cafeRelation.cafe));
      });

      state.cafes = cafes;
    },
    setUserData(state, payload) {
      state.user = new User(payload);
    },
    setCafeDetailData(state, payload) {
      state.activeCafe
        .setAddress(payload.address)
        .setLocation(payload.location)
        .setDescription(payload.description);
    },
    setActiveCafe(state, cafe) {
      state.activeCafe = cafe || null;
      if (cafe && cafe.id) localStorage.setItem("activeCafe", JSON.stringify(cafe));
      else localStorage.removeItem("activeCafe");
    },
    setActiveCafeBasicInfo(state, payload) {
      state.activeCafe.setBasicInfo(payload)
    },
    setTestVerificationCode(state, payload) {
      state.testVerificationCode = payload
    }
  },
  // -----------------------------------------------------------------
  actions: {
    /* Send Phone Number

			* payload: { phone_number }
			* API 200 response data: test server -> { verification code as code } main server -> nothing
		*/
    sendPhoneNumber(context, payload) {
      mixin.methods
      .baseRequest({
        // login user api call
        url: "api/v1/user-profile/send-code/",
        method: "POST",
        data: {
          phone_number: payload,
        }
      })
      .then(res => {
        if (res.data.code) {
          context.commit('setTestVerificationCode', res.data.code)
        }
      })
      .catch(err => {
        context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
      });
    },
    /* Login User

			* payload: { phone_number, password }
			* API response: { token, cafe_relations: [ { cafe } ] }
		*/
    login(context, payload) {
      mixin.methods
        .baseRequest({
          // login user api call
          url: "api/v1/user-profile/cafe-auth-token/",
          method: "POST",
          data: {
            phone_number: payload.phone_number,
            password: payload.password
          },
        })
        .then((res) => {
          context.commit("setCafesData", res.data.cafe_relations); // create related cafe classes

          localStorage.setItem("token", res.data.token); // save token into localstorage

          context.dispatch("getUserData"); // get user data
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status == 400) {
              message.error({
                content: "اطلاعات ورودی معتبر نیست",
                duration: 2,
              });
            }
            else if (err.response.status == 403) {
              context.rootState.errors = {
                code: ['لطفا کد ارسال شده را به دقت مجددا وارد کنید']
              }
            }
            else if (err.response.status == 404) {
              context.rootState.errors = {
                code: ['لطفا کمی بعد مجددا تلاش کنید']
              }
            }
          }
        });
    },
    /* Get User Data

			* payload: token
			* API response: { full_name, email, national_code, has_usable_password,
													phone_number, verification_status, get_verification_status_display }
		*/
    getUserData(context, payload) {
      return mixin.methods
        .request({
          url: "api/v1/user-profile/",
          method: "GET",
        })
        .then((res) => {
          res.data["token"] = localStorage.getItem("token"); // get user token from localstorage
          
          context.commit("setUserData", res.data); // create user class instance
          
          message.success({
            content: `${context.state.user.fullName} خوش آمدید`,
            duration: 2,
          });
          
          const saved = context.state.activeCafe;
          const selected = context.state.cafes.find(cafe => saved && cafe.id == saved.id)
            || (context.state.cafes.length === 1 ? context.state.cafes[0] : null);
          context.commit("setActiveCafe", selected);
          if (!selected) {
            context.rootState.loadWholePage = false;
            if (router.currentRoute.path !== "/stores") router.replace("/stores").catch(() => {});
            return;
          }
          context.dispatch("getCafeData");
          if ((payload && payload.redirectAfterLoad) || ["/login", "/stores", "/"].includes(router.currentRoute.path)) {
            router.replace("/tables").catch(() => {});
          }
        })
        .catch((err) => {
          context.state.localLoading = false; // deactive loading mode
          if (err.response) {
            if (err.response.status == 400) {
              message.error("اطلاعات کاربر به درستی دریافت نشد");
            }
          }
        });
    },
    /* Get Cafe Data

			* payload: cafe_id
			* API response: { name, description, location, address }
		*/
    getCafeData(context) {
      if (!context.state.activeCafe || !context.state.activeCafe.id) return Promise.resolve(false);
      return mixin.methods
        .request({
          url: "api/v1/cafe/" + context.state.activeCafe.id + "/update/basic/",
          method: "GET",
        })
        .then((res) => {
          context.commit("setCafeDetailData", res.data);
          context.commit("printerModule/setCloudPrinters", res.data.printers, {
            root: true,
          });
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status == 400) {
              message.error({
                content: "اطلاعات کافه به درستی دریافت نشد",
                duration: 2,
              });
            }
          }
        });
    },
    /* Get User Cafe Relations

			* payload: token
			* API response: { token, cafe_relations: [ { cafe } ] }
		*/
    getUserCafeRelations: context => {
      return mixin.methods.request({ url: "api/v1/auth/info/", method: "GET" })
        .then(res => {
          context.commit("setCafesData", res.data.cafe_relations);
          return context.dispatch("getUserData");
        })
        .catch(() => { context.rootState.loadWholePage = false; });
    },
    getActiveCafeBasicInfo(context) {
      if (!context.state.activeCafe || !context.state.activeCafe.id) return Promise.resolve(false);
      return mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.userModule.activeCafe.id +
            "/basic/info/"
        })
        .then(res => {
          context.commit("setActiveCafeBasicInfo", res.data);
        })
        .catch(() => {});
    },
  },
};
