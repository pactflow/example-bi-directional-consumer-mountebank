export class Product {
  constructor({id, name, type}) {
    if (!id || !name || !type) {
      throw Error("id, name and type are required properties")
    }
    this.id = id
    this.name = name
    this.type = type
  }
}