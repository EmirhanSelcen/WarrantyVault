const productService = require("../services/productService");

async function list(req, res, next) {
  try {
    const products = await productService.listProducts(req.user.id, req.query);
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const product = await productService.getProduct(req.user.id, Number(req.params.id));
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const product = await productService.createProduct(req.user.id, req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const product = await productService.updateProduct(req.user.id, Number(req.params.id), req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await productService.deleteProduct(req.user.id, Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create, update, remove };
