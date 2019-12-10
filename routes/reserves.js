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

/* GET reserves listing. */
router.get('/:id', catchErrors(async (req, res, next) => {
  const reserve = await Reserve.findById(req.params.id).populate('author');
  res.render('reserves/index', {reserve: reserve});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('reserves/new', {reserve: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const reserve = await Reserve.findById(req.params.id);
    res.render('reserves/edit', {reserve: reserve});
  }));

router.put('/:id', catchErrors(async (req, res, next) => {
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
