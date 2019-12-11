const express = require('express');
const Product = require('../models/product');
const Comment = require('../models/comment'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();


function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '로그인을 먼저 해주세요.');
    res.redirect('/signin');
  }
}

function validateForm(form) {
  var title = form.title || "";
  var place = form.place || "";
  var cost = form.cost || "";
  var content = form.content || "";
  title = title.trim();
  place = place.trim();
  cost = cost.trim();
  content = content.trim();

  if (!title) {
    return '여행 상품 이름을 입력해주세요.';
  }

  if (!place) {
    return '여행지를 입력해주세요.';
  }

  if (!cost) {
    return '1인당 비용을 입력해주세요.';
  }

  if (!content) {
    return '여행 코스 설명을 입력해주세요.';
  }

  return null;
}


/* GET products listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const products = await Product.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('products/index', {products: products, term: term, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('products/new', {product: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  res.render('products/edit', {product: product});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('author');
  const comments = await Comment.find({product: product.id}).populate('author');
  product.numReads++;

  await product.save();
  res.render('products/show', {product: product, comments: comments});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  
  const product = await Product.findById(req.params.id);
  if (!product) {
    req.flash('danger', '여행 상품이 존재하지 않습니다.');
    return res.redirect('back');
  }
  product.title = req.body.title;
  product.place = req.body.place;
  product.course = req.body.course;
  product.cost = req.body.cost;
  product.content = req.body.content;
  product.tags = req.body.tags.split(" ").map(e => e.trim());

  await product.save();
  req.flash('success', '성공적으로 수정되었습니다.');
  res.redirect('/products');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Product.findOneAndRemove({_id: req.params.id});
  req.flash('success', '성공적으로 삭제되었습니다.');
  res.redirect('/products');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  
  const user = req.user;
  var product = new Product({
    title: req.body.title,
    place: req.body.place,
    course: req.body.course,
    cost: req.body.cost,
    author: user._id,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await product.save();
  req.flash('success', '성공적으로 등록되었습니다.');
  res.redirect('/products');
}));

router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const product = await Product.findById(req.params.id);

  if (!product) {
    req.flash('danger', '여행 상품이 존재하지 않습니다.');
    return res.redirect('back');
  }

  var comment = new Comment({
    author: user._id,
    product: product._id,
    content: req.body.content
  });
  await comment.save();
  product.numComment++;
  await product.save();

  req.flash('success', '성공적으로 댓글이 등록되었습니다.');
  res.redirect(`/products/${req.params.id}`);
}));


module.exports = router;
