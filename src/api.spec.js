import { imposterPort } from "../test/config";
import { ProductAPIClient } from "./api";
import { Product } from "./product";
import { startAndClearStubs, writeStubs, stopStubs } from "../test/mountebank";

import {
  Response,
  Imposter,
  Mountebank,
  Stub,
  EqualPredicate,
  HttpMethod,
  NotFoundResponse,
} from "@anev/ts-mountebank";

describe("API Contract Test", () => {
  const mb = new Mountebank();
  const api = new ProductAPIClient(`http://localhost:${imposterPort}`);
  const imposter = new Imposter()
    .withPort(imposterPort)
    .withRecordRequests(true);

  beforeAll(() => startAndClearStubs());
  afterEach(() => writeStubs(mb, imposterPort));
  afterAll(() => stopStubs());

  const expectedProduct = {
    id: "10",
    type: "CREDIT_CARD",
    name: "28 Degrees",
  };

  describe("retrieving products", () => {
    test("products exists", async () => {
      // Arrange
      imposter
        .withStub(
          new Stub()
            .withPredicate(
              new EqualPredicate()
                .withMethod(HttpMethod.GET)
                .withPath("/products")
            )
            .withResponse(
              new Response().withStatusCode(200).withJSONBody([expectedProduct])
            )
        )
      await mb.createImposter(imposter);

      // make request to Pact mock server
      const products = await api.getAllProducts();

      // assert that we got the expected response
      expect(products).toStrictEqual([new Product(expectedProduct)]);
    });
  });

  describe("retrieving a product", () => {
    beforeAll(async () => {
      // Arrange
      imposter
        .withStub(
          new Stub()
            .withPredicate(
              new EqualPredicate()
                .withMethod(HttpMethod.GET)
                .withPath("/product/10")
            )
            .withResponse(
              new Response().withStatusCode(200).withJSONBody(expectedProduct)
            )
        )
        .withStub(new Stub().withResponse(new NotFoundResponse()));

      await mb.createImposter(imposter);
    });

    test("ID 10 exists", async () => {
      // Act
      const product = await api.getProduct("10");

      // Assert - did we get the expected response
      expect(product).toStrictEqual(new Product(expectedProduct));
    });

    test("product does not exist", async () => {
      // Act + Assert
      await expect(api.getProduct("11")).rejects.toThrow(
        "Request failed with status code 404"
      );
    });
  });
});
