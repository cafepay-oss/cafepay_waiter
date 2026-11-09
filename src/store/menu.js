import mixin from "@/mixin";

import Category from "@/models/CategoryClass";
import Menu from "@/models/MenuClass";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    menus: [], // menuClass instance
    newMenu: false,
    isModalActive: false,
    isMenuModalActive: false,
    isCategoryMenuModalActive: false
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    /* create menu instance and commit them to state */
    setMenus(state, menusData) {
      let menus = [];

      menusData.forEach(menu => {
        menus.push(new Menu(menu));
      });

      state.menus = menus;
      state.newMenu = true;
    }
  },
  // -----------------------------------------------------------------
  actions: {
    /* get menus of cafe and initialize categories' data */
    getMenus: context => {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.userModule.activeCafe.id +
            "/menu/list/"
        })
        .then(res => {
          context.commit("setMenus", res.data);
        })
        .catch(() => {});
    },
    /* get menus' categories and fill categories array
			  
				* for each menu call menu-category API and then find categories and add them 
				* into lists of categories. 
				* then commit them to its menu 
				* 
				* menu-category API differs from category-product API ( tell sina and change it later )
		*/
    fillCategories: context => {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.userModule.activeCafe.id +
            "/category-based-menu/list/"
        })
        .then(res => {
          res.data.forEach(object => {
            let categories = [];

            object.categories.forEach(cat => {
              categories.push(
                context.rootState.categoryModule.categories.find(
                  category => cat.pk == category.id
                )
              );
            });

            let menu = context.rootState.menuModule.menus.find(
              menu => menu.id == object.pk
            );

            menu.setCategories(categories);
          });
        })
        .catch(e => {});
    },
  }
}