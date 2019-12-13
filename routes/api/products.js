const express = require('express');
const product = require('../../models/product');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

// Index
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const products = await Product.paginate({}, {
    sort: {createdAt: -1}, 
    populate: 'author',
    page: page, limit: limit
  });
  res.json({products: products.docs, page: products.page, pages: products.pages});   
}));

// Read
router.get('/:id', catchErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('author');
  res.json(product);
}));

// Create
router.post('', catchErrors(async (req, res, next) => {
  var product = new Product({
    title: req.body.title,
    place: req.body.place,
    course: req.body.course,
    cost: req.body.cost,
    author: req.user._id,
    content: req.body.content,
    site: req.body.site,
    tags: req.body.tags.map(e => e.trim()),
  });
  await product.save();
  res.json(product)
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next({status: 404, msg: '여행 상품이 존재하지 않습니다.'});
  }
  if (product.author && product.author._id != req.user._id) {
    return next({status: 403, msg: '수정할 수 없습니다.'});
  }
  product.title = req.body.title;
  product.place = req.body.place;
  product.course = req.body.course;
  product.cost = req.body.cost;
  product.content = req.body.content;
  product.site = req.body.site;
  product.tags = req.body.tags;
  await product.save();
  res.json(product);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next({status: 404, msg: '여행 상품이 존재하지 않습니다.'});
  }
  if (product.author && product.author._id != req.user._id) {
    return next({status: 403, msg: '수정할 수 없습니다.'});
  }
  await Product.findOneAndRemove({_id: req.params.id});
  res.json({msg: '삭제되었습니다.'});
}));


module.exports = router;