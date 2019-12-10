const express = require('express');
const Product = require('../../models/product'); 
const Comment = require('../../models/comment'); 
const LikeLog = require('../../models/like-log'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/products', require('./products'));

// Like for Product
router.post('/products/:id/like', catchErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next({status: 404, msg: '여행 상품이 존재하지 않습니다.'});
  }
  var likeLog = await LikeLog.findOne({author: req.user._id, product: product._id});
  if (!likeLog) {
    product.numLikes++;
    await Promise.all([
      product.save(),
      LikeLog.create({author: req.user._id, product: product._id})
    ]);
  }
  return res.json(product);
}));

// Like for Comment
router.post('/comments/:id/like', catchErrors(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  comment.numLikes++;
  await comment.save();
  return res.json(comment);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;
