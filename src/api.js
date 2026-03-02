const axios = require("axios");
const { Product } = require("./product");

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

  generateAuthToken() {
      return "Bearer " + new Date().toISOString()
  }

  async getAllProducts() {
    return axios
      .get(this.withPath("/products"), {
            headers: {
                "Authorization": this.generateAuthToken()
            }
        })
      .then((r) => r.data.map((p) => new Product(p)));
  }

  async getProduct(id) {
    return axios
      .get(this.withPath("/products/" + id), {
            headers: {
                "Authorization": this.generateAuthToken()
            }
        })
      .then((r) => new Product(r.data));
  }
}
