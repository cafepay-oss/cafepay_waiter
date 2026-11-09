import mixin from "@/mixin";
import Product from "@/models/ProductClass";
import { message } from "ant-design-vue";

const availabilityUpdates = new Set();

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    products: [], // produtcClass instance
    newProduct: false,
    isProductModalActive: false
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    /* create product instance and commit them to state */
    setProducts(state, productsData) {
      let products = [];

      productsData.forEach(product => {
        products.push(new Product(product));
      });

      state.products = products;
      state.newProduct = true;
    },
    setProduct(state, payload) {
      let relatedProduct = state.products.find(
        product => product.id == payload.pk
      );
      relatedProduct.available = payload.available;
      relatedProduct.count = payload.count;
      relatedProduct.category = payload.category;
      relatedProduct.images = payload.images;
      relatedProduct.deleted = payload.is_deleted;
      relatedProduct.discount = payload.discount;
      relatedProduct.discription = payload.discription;
      relatedProduct.name = payload.name;
      relatedProduct.original_price = payload.original_price;
      relatedProduct.overallRating = payload.overall_rating;
    },
    setProductImage(state, payload) {
      let relatedProduct = state.products.find(
        product => product.id == payload.product.pk
      );
      relatedProduct.images.unshift(payload.image);
    }
  },
  // -----------------------------------------------------------------
  actions: {
    /* get products of cafe and initialize product's data */
    getProducts: context => {
      mixin.methods
        .request({
          method: "get",
          url:
            "api/v1/cafe/" +
            context.rootState.userModule.activeCafe.id +
            "/product/list/"
        })
        .then(res => {
          context.commit("setProducts", res.data);
        })
        .catch(() => {});
    },
    /* change availablity of products in cafe */
    changeAvailablity: async (context, product) => {
      if (availabilityUpdates.has(product.id)) return false;
      availabilityUpdates.add(product.id);
      try {
        const response = await mixin.methods.request({
          method: "put",
          url: "api/v1/product/" + product.id + "/toggle-availability/"
        });
        product.available = response.data && typeof response.data.available === "boolean"
          ? response.data.available : !product.available;
        return true;
      } catch (error) {
        message.error(`مشکلی در تغییر وضعیت محصول "${product.name}" به وجود آمد`);
        return false;
      } finally {
        availabilityUpdates.delete(product.id);
      }
    },
  }
}