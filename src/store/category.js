import mixin from "@/mixin";
import Category from "@/models/CategoryClass";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    categories: [], // categoryClass instance
    newCategory: false,

    isCategoryModalActive: false,
    isAddProductToCategoryModalActive: false
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    setCategories(state, categories) {
      state.categories = categories;
      state.newCategory = true;
    }
  },
  // -----------------------------------------------------------------
  actions: {
    /* create category instance and commit them to state */
    initialCategories: (context, categoriesData) => {
      let categories = [];

      categoriesData.forEach(category => {
        categories.push(new Category(category));
      });

      context.commit("setCategories", categories);
    },
    /* get categories of cafe and initialize categories' data */
    getCategories: context => {
      mixin.methods
        .request({
          method: "get",
          url:
            "api/v1/cafe/" +
            context.rootState.userModule.activeCafe.id +
            "/category/list/"
        })
        .then(res => {
          context.dispatch("initialCategories", res.data);
        })
        .catch(e => {});
    },
    
    /* get categories' products and fill products array

        * for each category call category-product API and then find products and add them 
        * into lists of products. 
        * then commit them to its category 
    */
    fillProducts: context => {
      context.state.categories.forEach(category => {
        mixin.methods
          .request({
            method: "get",
            url: "api/v1/category/" + category.id + "/products/"
          })
          .then(res => {
            let products = [];

            res.data.products.forEach(pro => {
              products.push(
                context.rootState.productModule.products.find(
                  product => pro.pk == product.id
                )
              );
            });
            
            category.setProducts(products);
          })
          .catch(e => {});
      });
    },
  }
}