const express = require('express');
const Reserve = require('../models/reserve');
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
  var productname = form.productname || "";
  var reserver = form.reserver || "";
  var totalcost = form.totalcost || "";
  var date = form.date || "";
  var count = form.count || "";
  var phonenumber = form.phonenumber || "";
  productname = productname.trim();
  reserver = reserver.trim();
  totalcost = totalcost.trim();
  date = date.trim();
  count = count.trim();
  phonenumber = phonenumber.trim();

  if (!productname) {
    return '여행 상품 이름을 입력해주세요.';
  }
  if (!reserver) {
    return '예약자의 이름을 입력해주세요.';
  }
  if (!totalcost) {
    return '총액을 입력해주세요.';
  }
  if (!date) {
    return '날짜를 입력해주세요.';
  }
  if (!count) {
    return '인원을 입력해주세요.';
  }
  if (!phonenumber) {
    return '전화번호를 입력해주세요.';
  }
  return null;
}

/* GET reserves listing. */
router.get('/', needAuth, catchErrors(async (req, res, next) => {
  const reserves = await Reserve.find({});
  res.render('reserves/index', {reserves: reserves});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('reserves/new', {reserves: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const reserve = await Reserve.findById(req.params.id);
    res.render('reserves/edit', {reserve: reserve});
  }));

router.put('/:id', catchErrors(async (req, res, next) => {
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  
  const reserve = await Reserve.findById(req.params.id);
  if (!reserve) {
    req.flash('danger', '예약 내역이 존재하지 않습니다.');
    return res.redirect('back');
  }
  reserve.productname = req.body.productname;
  reserve.reserver = req.body.reserver;
  reserve.phonenumber = req.body.phonenumber;
  reserve.date = req.body.date;
  reserve.count = req.body.count;
  reserve.totalcost = req.body.totalcost;

  await reserve.save();
  req.flash('success', '성공적으로 예약 내역이 수정되었습니다.');
  res.redirect('/reserves');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Reserve.findOneAndRemove({_id: req.params.id});
  req.flash('success', '성공적으로 예약이 취소되었습니다.');
  res.redirect('/reserves');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  
  const user = req.user;
  var reserve = new Reserve({
    productname: req.body.productname,
    reserver: req.body.reserver,
    phonenumber: req.body.phonenumber,
    date: req.body.date,
    count: req.body.count,
    totalcost: req.body.totalcost,
    author: user._id,
  });
  await reserve.save();
  req.flash('success', '성공적으로 예약되었습니다.');
  res.redirect('/reserves');
}));


module.exports = router;
