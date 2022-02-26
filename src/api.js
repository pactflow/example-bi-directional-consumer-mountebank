const axios = require("axios");
const adapter = require("axios/lib/adapters/http");
const { Product } = require("./product");

axios.defaults.adapter = adapter;

export class ProductAPIClient {
  constructor(url) {
    if (url === undefined || url === "") {
      url = process.env.BASE_URL;
    }
    if (url.endsWith("/")) {
      url = url.substr(0, url.length - 1);
    }
    this.url = url;
  }

  withPath(path) {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    return `${this.url}${path}`;
  }

  async getAllProducts() {
    return axios
      .get(this.withPath("/products"))
      .then((r) => r.data.map((p) => new Product(p)));
  }

  async getProduct(id) {
    return axios
      .get(this.withPath("/product/" + id))
      .then((r) => new Product(r.data));
  }
}
