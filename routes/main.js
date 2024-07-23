var express = require('express');
var {mappings,MongoDB_url} = require('../config');
var router = express.Router();
// //////////
const {
  MongoClient
} = require('mongodb');
const url = MongoDB_url==""?'mongodb://localhost:27017':MongoDB_url;
const dbName = 'grasscutter';
router.post("/", function (req, res, next) {
  let UID = req.body.UID; // 从请求体中获取用户名
  // // 转为数字
  if (!isNaN(parseFloat(UID)) && isFinite(UID)) {
    UID = parseInt(UID);
  } else {
    res.send({
      code: 400,
      msg: "请输入正确的用户名"
    });
    console.log(typeof UID);
    return;
  }
  (async function () {

    let client;
    try {
      // Connect to the MongoDB cluster
      client = await MongoClient.connect(url);
      console.log("Connected successfully to server");

      const db = client.db(dbName);

      const accountsCollection = db.collection('accounts');
      if (await accountsCollection.find({ _id: "" + UID + "" }).count() == 0) {
        res.send(
          `
          <link rel="stylesheet" type="text/css" href="css/materialdesignicons.min.css">
          <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
          <link rel="stylesheet" type="text/css" href="css/animate.min.css">
          <link rel="stylesheet" type="text/css" href="js/bootstrap-multitabs/multitabs.min.css">
          <link rel="stylesheet" type="text/css" href="css/style.min.css">
          <body>
          <div class="container">
            <div class="card border-yellow text-center">
              <div class="card-header text-yellow">
                警告⚠
              </div>
              <div class="card-body">
                <h5 class="card-title">用户不存在！</h5>
                <p class="card-text">请检查您的UID是否正确，输入正确的UID才行哦！！！</p>
                <button class="btn btn-primary" onclick="parent.location.reload();">重新输入</button>
              </div>
            </div>
          </div>
          </body>
          <script type="text/javascript" src="js/jquery.min.js"></script>
          <script type="text/javascript" src="js/popper.min.js"></script>
          <script type="text/javascript" src="js/bootstrap.min.js"></script>
          <script type="text/javascript" src="js/perfect-scrollbar.min.js"></script>
          <script type="text/javascript" src="js/bootstrap-multitabs/multitabs.min.js"></script>
          <script type="text/javascript" src="js/jquery.cookie.min.js"></script>
          <script type="text/javascript" src="js/index.min.js"></script>
          `
        );
        console.log("用户不存在");
        return;
      }

      const gachaCollection = db.collection('gachas');

      const results301 = await gachaCollection.find({
        ownerId: UID,
        gachaType: 301
      }).sort({
        transactionDate: 1
      }).toArray();
      const results302 = await gachaCollection.find({
        ownerId: UID,
        gachaType: 302
      }).sort({
        transactionDate: 1
      }).toArray();
      const results100 = await gachaCollection.find({
        ownerId: UID,
        gachaType: 100
      }).sort({
        transactionDate: 1
      }).toArray();
      const results400 = await gachaCollection.find({
        ownerId: UID,
        gachaType: 400
      }).sort({
        transactionDate: 1
      }).toArray();
      const results200 = await gachaCollection.find({
        ownerId: UID,
        gachaType: 200
      }).sort({
        transactionDate: 1
      }).toArray();
      // 今日抽卡总数
      const resultstoday = await gachaCollection.find({ ownerId: UID, transactionDate: { $gte: new Date(getNowFormatDate()), $lt: new Date(getTomorrowFormatDate()) } }).count();
      // console.log("总数："+resultstoday);
      const resultsgachacount = await gachaCollection.find({ ownerId: UID }).count();
      // console.log("抽卡总数：" + resultsgachacount);
      const resultsYellowTotal = await gachaCollection.find({
        ownerId: UID,
        $or:[{gachaType: 301},{gachaType: 302},{gachaType: 400}]
      }).sort({
        transactionDate: 1
      }).toArray();
      let lastYellowIndex301 = -1; // 记录最近一个yellow物品的索引
      let lastYellowIndex302 = -1; // 记录最近一个yellow物品的索引
      let lastYellowIndex100 = -1; // 记录最近一个yellow物品的索引
      let lastYellowIndex400 = -1; // 记录最近一个yellow物品的索引
      let lastYellowIndex200 = -1; // 记录最近一个yellow物品的索引
      let lastYellowTotalndex = -1;

      let yellowItems301 = []; // 保存yellow物品的键和值
      let yellowItems302 = [];
      let yellowItems100 = [];
      let yellowItems400 = [];
      let yellowItems200 = [];
      let resultsYellowTotalItem = []; // 保存yellow物品的键和值

      let intervals301 = []; // 保存两个yellow物品间的间隔
      let intervals302 = []; // 保存两个yellow物品间的间隔
      let intervals100 = []; // 保存两个yellow物品间的间隔
      let intervals400 = []; // 保存两个yellow物品间的间隔
      let intervals200 = []; // 保存两个yellow物品间的间隔
      let intervalsYellowTotal = []; // 保存两个yellow物品间的间隔

      let postYellowCount301 = 0; // 在最后一个yellow物品之后的记录数量
      let postYellowCount302 = 0; // 在最后一个yellow物品之后的记录数量
      let postYellowCount100 = 0; // 在最后一个yellow物品之后的记录数量
      let postYellowCount400 = 0; // 在最后一个yellow物品之后的记录数量
      let postYellowCount200 = 0; // 在最后一个yellow物品之后的记录数量
      let postYellowCountYellowTotal = 0;

      //**********************************************************************301 */
      for (let i = 0; i < results301.length; i++) {
        const item = results301[i];
        const mapping = mappings[item.itemID];

        // 检查映射是否存在并且颜色是否为"yellow"
        if (mapping && mapping[1] === "yellow" && item.gachaType === 301) {
          yellowItems301.push({
            itemID: item.itemID,
            gachaType: item.gachaType,
            ...mapping
          });
          if (lastYellowIndex301 >= 0) {
            intervals301.push(i - lastYellowIndex301);
          }
          lastYellowIndex301 = i;
        }
      }
      // 如果 lastYellowIndex 不是 -1，说明有yellow物品被找到过
      if (lastYellowIndex301 !== -1) {
        postYellowCount301 = results301.length - lastYellowIndex301 - 1;
      }

      //**********************************************************************302 */

      for (let i = 0; i < results302.length; i++) {
        const item = results302[i];
        const mapping = mappings[item.itemID];

        // 检查映射是否存在并且颜色是否为"yellow"
        if (mapping && mapping[1] === "yellow" && item.gachaType === 302) {
          yellowItems302.push({
            itemID: item.itemID,
            gachaType: item.gachaType,
            ...mapping
          });
          if (lastYellowIndex302 >= 0) {
            intervals302.push(i - lastYellowIndex302);
          }
          lastYellowIndex302 = i;
        }
      }
      // 如果 lastYellowIndex 不是 -1，说明有yellow物品被找到过
      if (lastYellowIndex302 !== -1) {
        postYellowCount302 = results302.length - lastYellowIndex302 - 1;
      }

      //**********************************************************************100 */

      for (let i = 0; i < results100.length; i++) {
        const item = results100[i];
        const mapping = mappings[item.itemID];

        // 检查映射是否存在并且颜色是否为"yellow"
        if (mapping && mapping[1] === "yellow" && item.gachaType === 100) {
          yellowItems100.push({
            itemID: item.itemID,
            gachaType: item.gachaType,
            ...mapping
          });
          if (lastYellowIndex100 >= 0) {
            intervals100.push(i - lastYellowIndex100);
          }
          lastYellowIndex100 = i;
        }
      }
      // 如果 lastYellowIndex 不是 -1，说明有yellow物品被找到过
      if (lastYellowIndex100 !== -1) {
        postYellowCount100 = results100.length - lastYellowIndex100 - 1;
      }

      //**********************************************************************400 */

      for (let i = 0; i < results400.length; i++) {
        const item = results400[i];
        const mapping = mappings[item.itemID];

        // 检查映射是否存在并且颜色是否为"yellow"
        if (mapping && mapping[1] === "yellow" && item.gachaType === 400) {
          yellowItems400.push({
            itemID: item.itemID,
            gachaType: item.gachaType,
            ...mapping
          });
          if (lastYellowIndex400 >= 0) {
            intervals400.push(i - lastYellowIndex400);
          }
          lastYellowIndex400 = i;
        }
      }
      // 如果 lastYellowIndex 不是 -1，说明有yellow物品被找到过
      if (lastYellowIndex400 !== -1) {
        postYellowCount400 = results400.length - lastYellowIndex400 - 1;
      }

      //**********************************************************************200 */

      for (let i = 0; i < results200.length; i++) {
        const item = results200[i];
        const mapping = mappings[item.itemID];

        // 检查映射是否存在并且颜色是否为"yellow"
        if (mapping && mapping[1] === "yellow" && item.gachaType === 200) {
          yellowItems200.push({
            itemID: item.itemID,
            gachaType: item.gachaType,
            ...mapping
          });
          if (lastYellowIndex200 >= 0) {
            intervals200.push(i - lastYellowIndex200);
          }
          lastYellowIndex200 = i;
        }
      }
      // 如果 lastYellowIndex 不是 -1，说明有yellow物品被找到过
      if (lastYellowIndex200 !== -1) {
        postYellowCount200 = results200.length - lastYellowIndex200 - 1;
      }

      //*********************************************************** */
      for (let i = 0; i < resultsYellowTotal.length; i++) {
        const item = resultsYellowTotal[i];
        const mapping = mappings[item.itemID];

        // 检查映射是否存在并且颜色是否为"yellow"
        if (mapping && mapping[1] === "yellow") {
          resultsYellowTotalItem.push({
            itemID: item.itemID,
            gachaType: item.gachaType,
            ...mapping
          });
          if (lastYellowIndex200 >= 0) {
            intervalsYellowTotal.push(i - lastYellowTotalndex);
          }
          lastYellowTotalndex = i;
        }
      }
      // 如果 lastYellowIndex 不是 -1，说明有yellow物品被找到过
      if (lastYellowTotalndex !== -1) {
        postYellowCountYellowTotal = resultsYellowTotal.length - lastYellowTotalndex - 1;
      }

      // console.log(yellowItems100.length); // 打印查询结果

      // router.get('/', function (req, res, next) {
      // 直接传递users对象，无需转换为字符串
      // console.log("数据发送成功");
      res.render('main', {
        title: 'Gacha List',
        status: true,
        UID: UID,
        yellowItemsCount301: yellowItems301.length, //出金总数
        yellowItemsCount302: yellowItems302.length,
        yellowItemsCount100: yellowItems100.length,
        yellowItemsCount400: yellowItems400.length,
        yellowItemsCount200: yellowItems200.length,
        yellowItemsCountYellowTotal: resultsYellowTotalItem.length,
        yellowItems301: yellowItems301, //卡池出金详情
        yellowItems302: yellowItems302,
        yellowItems100: yellowItems100,
        yellowItems400: yellowItems400,
        yellowItems200: yellowItems200,
        yellowItemsYellowTotal: resultsYellowTotalItem,
        intervals301: intervals301, //间隔几抽出金
        intervals302: intervals302,
        intervals100: intervals100,
        intervals400: intervals400,
        intervals200: intervals200,
        intervalsYellowTotal: intervalsYellowTotal,
        postYellowCount301: postYellowCount301, //最后抽出金之后，垫了几抽
        postYellowCount302: postYellowCount302,
        postYellowCount100: postYellowCount100,
        postYellowCount400: postYellowCount400,
        postYellowCount200: postYellowCount200,
        postYellowCountYellowTotal: postYellowCountYellowTotal,
        resultstoday: resultstoday,        // 今日抽卡总数
        resultsgachacount: resultsgachacount// 抽卡总数
      });
      // });

    } finally {
      // Close connection
      await client.close();
    }
  })();
});
router.get("/", function (req, res, next) {
  res.render('main', {
    title: 'Gacha List',
    status: false,
    yellowItemsCount301: 0, //出金总数
    yellowItemsCount302: 0,
    yellowItemsCount100: 0,
    yellowItemsCount400: 0,
    yellowItemsCount200: 0,
    yellowItemsCountYellowTotal: 0,
    yellowItems301: [], //卡池出金详情
    yellowItems302: [],
    yellowItems100: [],
    yellowItems400: [],
    yellowItems200: [],
    yellowItemsYellowTotal: [],
    intervals301: [], //间隔几抽出金
    intervals302: [],
    intervals100: [],
    intervals400: [],
    intervals200: [],
    intervalsYellowTotal: [],
    postYellowCount301: 0, //最后抽出金之后，垫了几抽
    postYellowCount302: 0,
    postYellowCount100: 0,
    postYellowCount400: 0,
    postYellowCount200: 0,
    postYellowCountYellowTotal: 0,
    resultstoday: 0,        // 今日抽卡总数
    resultsgachacount: 0// 抽卡总数
  });
});

//获取当前日期函数
function getNowFormatDate() {
  let date = new Date(),
    year = date.getFullYear(), //获取完整的年份(4位)
    month = date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
    strDate = date.getDate() // 获取当前日(1-31)
  if (month < 10) month = `0${month}` // 如果月份是个位数，在前面补0
  if (strDate < 10) strDate = `0${strDate}` // 如果日是个位数，在前面补0

  return `${year}-${month}-${strDate}`
}
//获取未来一天函数
function getTomorrowFormatDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // 设置明天的日期
  return tomorrow.toISOString().substring(0, 10);
}
module.exports = router;