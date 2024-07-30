var express = require('express');
var router = express.Router();
// //////////
var version_config = {
  "version": "0.0.3",
  "type":"Release",
  "description": "Gacha List",
  "daytime": getDayTime()
}

////////计算白天还是晚上
function getDayTime() {
  var now = new Date();
  var hour = now.getHours();
  if (hour < 6 || hour >= 18) {
    return "0";
  } else {
    return "1";
  }
}

router.get("/", function (req, res, next) {
  // const username = req.body.username; // 从请求体中获取用户名
  res.render('index', {
    title: version_config.description,
    version: version_config.version,
    type: (version_config.type=="Release"?"项目开源，请勿用于商业用途":"测试版内容不代表正式版内容"),
    daytime: version_config.daytime
  });
});
module.exports = router;