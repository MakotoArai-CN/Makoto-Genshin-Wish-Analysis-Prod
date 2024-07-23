var express = require('express');
var router = express.Router();
// //////////

router.get("/", function (req, res, next) {
  // const username = req.body.username; // 从请求体中获取用户名
  res.render('index', {
    title: 'Gacha List',
    status:false
  });
});
module.exports = router;