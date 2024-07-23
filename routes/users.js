var express = require('express');
var router = express.Router();
// //////////
const {
  MongoClient
} = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'grasscutter';
const mappings = {
  "1001": ["凯特 (角色)", "purple"],
  "1002": ["神里绫华 (角色)", "yellow"],
  "1003": ["琴 (角色)", "yellow"],
  "1005": ["旅行者 (角色)", "yellow"],
  "1006": ["丽莎 (角色)", "purple"],
  "1007": ["旅行者 (角色)", "yellow"],
  "1014": ["芭芭拉 (角色)", "purple"],
  "1015": ["凯亚 (角色)", "purple"],
  "1016": ["迪卢克 (角色)", "yellow"],
  "1020": ["雷泽 (角色)", "purple"],
  "1021": ["安柏 (角色)", "purple"],
  "1022": ["温迪 (角色)", "yellow"],
  "1023": ["香菱 (角色)", "purple"],
  "1024": ["北斗 (角色)", "purple"],
  "1025": ["行秋 (角色)", "purple"],
  "1026": ["魈 (角色)", "yellow"],
  "1027": ["凝光 (角色)", "purple"],
  "1029": ["可莉 (角色)", "yellow"],
  "1030": ["钟离 (角色)", "yellow"],
  "1031": ["菲谢尔 (角色)", "purple"],
  "1032": ["班尼特 (角色)", "purple"],
  "1033": ["达达利亚 (角色)", "yellow"],
  "1034": ["诺艾尔 (角色)", "purple"],
  "1035": ["七七 (角色)", "yellow"],
  "1036": ["重云 (角色)", "purple"],
  "1037": ["甘雨 (角色)", "yellow"],
  "1038": ["阿贝多 (角色)", "yellow"],
  "1039": ["迪奥娜 (角色)", "purple"],
  "1041": ["莫娜 (角色)", "yellow"],
  "1042": ["刻晴 (角色)", "yellow"],
  "1043": ["砂糖 (角色)", "purple"],
  "1044": ["辛焱 (角色)", "purple"],
  "1045": ["罗莎莉亚 (角色)", "purple"],
  "1046": ["胡桃 (角色)", "yellow"],
  "1047": ["枫原万叶 (角色)", "yellow"],
  "1048": ["烟绯 (角色)", "purple"],
  "1049": ["宵宫 (角色)", "yellow"],
  "1050": ["托马 (角色)", "purple"],
  "1051": ["优菈 (角色)", "yellow"],
  "1052": ["雷电将军 (角色)", "yellow"],
  "1053": ["早柚 (角色)", "purple"],
  "1054": ["珊瑚宫心海 (角色)", "yellow"],
  "1055": ["五郎 (角色)", "purple"],
  "1056": ["九条裟罗 (角色)", "purple"],
  "1057": ["荒泷一斗 (角色)", "yellow"],
  "1058": ["八重神子 (角色)", "yellow"],
  "1059": ["鹿野院平藏 (角色)", "purple"],
  "1060": ["夜兰 (角色)", "yellow"],
  "1062": ["埃洛伊 (角色)", ""],
  "1063": ["申鹤 (角色)", "yellow"],
  "1064": ["云堇 (角色)", "purple"],
  "1065": ["久岐忍 (角色)", "purple"],
  "1066": ["神里绫人 (角色)", "yellow"],
  "1067": ["柯莱 (角色)", "purple"],
  "1068": ["多莉 (角色)", "purple"],
  "1069": ["提纳里 (角色)", "yellow"],
  "1070": ["妮露 (角色)", "yellow"],
  "1071": ["赛诺 (角色)", "yellow"],
  "1072": ["坎蒂丝 (角色)", "purple"],
  "1073": ["纳西妲 (角色)", "yellow"],
  "1074": ["莱依拉 (角色)", "purple"],
  "1075": ["流浪者 (角色)", "yellow"],
  "1076": ["珐露珊 (角色)", "purple"],
  "1077": ["瑶瑶 (角色)", "purple"],
  "1078": ["艾尔海森 (角色)", "yellow"],
  "1079": ["迪希雅 (角色)", "yellow"],
  "1080": ["米卡 (角色)", "purple"],
  "1081": ["卡维 (角色)", "purple"],
  "1082": ["白术 (角色)", "yellow"],
  "11301": ["冷刃 (武器)", "blue"],
  "11302": ["黎明神剑 (武器)", "blue"],
  "11303": ["旅行剑 (武器)", "blue"],
  "11304": ["暗铁剑 (武器)", "blue"],
  "11305": ["吃虎鱼刀 (武器)", "blue"],
  "11306": ["飞天御剑 (武器)", "blue"],
  "11401": ["西风剑 (武器)", "purple"],
  "11402": ["笛剑 (武器)", "purple"],
  "11403": ["祭礼剑 (武器)", "purple"],
  "11404": ["宗室长剑 (武器)", "purple"],
  "11405": ["匣里龙吟 (武器)", "purple"],
  "11406": ["试作斩岩 (武器)", "purple"],
  "11407": ["铁蜂刺 (武器)", "purple"],
  "11408": ["黑岩长剑 (武器)", "purple"],
  "11409": ["黑剑 (武器)", "purple"],
  "11410": ["暗巷闪光 (武器)", "purple"],
  "11411": ["[N/A] 1135130229 (武器)", "purple"],
  "11412": ["降临之剑 (武器)", "purple"],
  "11413": ["腐殖之剑 (武器)", "purple"],
  "11414": ["天目影打刀 (武器)", "purple"],
  "11415": ["辰砂之纺锤 (武器)", "purple"],
  "11416": ["笼钓瓶一心 (武器)", "purple"],
  "11417": ["原木刀 (武器)", "purple"],
  "11418": ["西福斯的月光 (武器)", "purple"],
  "11419": ["「一心传」名刀 (武器)", "purple"],
  "11420": ["「一心传」名刀 (武器)", "purple"],
  "11421": ["「一心传」名刀 (武器)", "purple"],
  "11422": ["东花坊时雨 (武器)", "purple"],
  "11501": ["风鹰剑 (武器)", "yellow"],
  "11502": ["天空之刃 (武器)", "yellow"],
  "11503": ["苍古自由之誓 (武器)", "yellow"],
  "11504": ["斫峰之刃 (武器)", "yellow"],
  "11505": ["磐岩结绿 (武器)", "yellow"],
  "11506": ["[EN] - Primordial Jade Cutter (武器)", "yellow"],
  "11507": ["[EN] - One Side (武器)", "yellow"],
  "11508": ["[N/A] 1664039091 (武器)", "yellow"],
  "11509": ["雾切之回光 (武器)", "yellow"],
  "11510": ["波乱月白经津 (武器)", "yellow"],
  "11511": ["圣显之钥 (武器)", "yellow"],
  "11512": ["裁叶萃光 (武器)", "yellow"],
  "12301": ["铁影阔剑 (武器)", "blue"],
  "12302": ["沐浴龙血的剑 (武器)", "blue"],
  "12303": ["白铁大剑 (武器)", "blue"],
  "12304": ["石英大剑 (武器)", "blue"],
  "12305": ["以理服人 (武器)", "blue"],
  "12306": ["飞天大御剑 (武器)", "blue"],
  "12401": ["西风大剑 (武器)", "purple"],
  "12402": ["钟剑 (武器)", "purple"],
  "12403": ["祭礼大剑 (武器)", "purple"],
  "12404": ["宗室大剑 (武器)", "purple"],
  "12405": ["雨裁 (武器)", "purple"],
  "12406": ["试作古华 (武器)", "purple"],
  "12407": ["白影剑 (武器)", "purple"],
  "12408": ["黑岩斩刀 (武器)", "purple"],
  "12409": ["螭骨剑 (武器)", "purple"],
  "12410": ["千岩古剑 (武器)", "purple"],
  "12411": ["雪葬的星银 (武器)", "purple"],
  "12412": ["衔珠海皇 (武器)", "purple"],
  "12414": ["桂木斩长正 (武器)", "purple"],
  "12415": ["玛海菈的水色 (武器)", "purple"],
  "12416": ["恶王丸 (武器)", "purple"],
  "12417": ["森林王器 (武器)", "purple"],
  "12418": ["饰铁之花 (武器)", "purple"],
  "12501": ["天空之傲 (武器)", "yellow"],
  "12502": ["狼的末路 (武器)", "yellow"],
  "12503": ["松籁响起之时 (武器)", "yellow"],
  "12504": ["无工之剑 (武器)", "yellow"],
  "12505": ["[EN] - Primordial Jade Greatsword (武器)", "yellow"],
  "12506": ["[EN] - The Other Side (武器)", "yellow"],
  "12508": ["[N/A] 759708203 (武器)", "yellow"],
  "12509": ["[N/A] 2507837467 (武器)", "yellow"],
  "12510": ["赤角石溃杵 (武器)", "yellow"],
  "12511": ["苇海信标 (武器)", "yellow"],
  "13301": ["白缨枪 (武器)", "blue"],
  "13302": ["钺矛 (武器)", "blue"],
  "13303": ["黑缨枪 (武器)", "blue"],
  "13304": ["「旗杆」 (武器)", "blue"],
  "13401": ["匣里灭辰 (武器)", "purple"],
  "13402": ["试作星镰 (武器)", "purple"],
  "13403": ["流月针 (武器)", "purple"],
  "13404": ["黑岩刺枪 (武器)", "purple"],
  "13405": ["决斗之枪 (武器)", "purple"],
  "13406": ["千岩长枪 (武器)", "purple"],
  "13407": ["西风长枪 (武器)", "purple"],
  "13408": ["宗室猎枪 (武器)", "purple"],
  "13409": ["龙脊长枪 (武器)", "purple"],
  "13414": ["喜多院十文字 (武器)", "purple"],
  "13415": ["「渔获」 (武器)", "purple"],
  "13416": ["断浪长鳍 (武器)", "purple"],
  "13417": ["贯月矢 (武器)", "purple"],
  "13419": ["风信之锋 (武器)", "purple"],
  "13501": ["护摩之杖 (武器)", "yellow"],
  "13502": ["天空之脊 (武器)", "yellow"],
  "13503": ["[N/A] 469555475 (武器)", "yellow"],
  "13504": ["贯虹之槊 (武器)", "yellow"],
  "13505": ["和璞鸢 (武器)", "yellow"],
  "13506": ["[EN] - Deicide (武器)", "yellow"],
  "13507": ["息灾 (武器)", "yellow"],
  "13509": ["薙草之稻光 (武器)", "yellow"],
  "13511": ["赤沙之杖 (武器)", "yellow"],
  "14301": ["魔导绪论 (武器)", "blue"],
  "14302": ["讨龙英杰谭 (武器)", "blue"],
  "14303": ["异世界行记 (武器)", "blue"],
  "14304": ["翡玉法球 (武器)", "blue"],
  "14305": ["甲级宝珏 (武器)", "blue"],
  "14306": ["琥珀玥 (武器)", "blue"],
  "14401": ["西风秘典 (武器)", "purple"],
  "14402": ["流浪乐章 (武器)", "purple"],
  "14403": ["祭礼残章 (武器)", "purple"],
  "14404": ["宗室秘法录 (武器)", "purple"],
  "14405": ["匣里日月 (武器)", "purple"],
  "14406": ["试作金珀 (武器)", "purple"],
  "14407": ["万国诸海图谱 (武器)", "purple"],
  "14408": ["黑岩绯玉 (武器)", "purple"],
  "14409": ["昭心 (武器)", "purple"],
  "14410": ["暗巷的酒与诗 (武器)", "purple"],
  "14411": ["[N/A] 415851979 (武器)", "purple"],
  "14412": ["忍冬之果 (武器)", "purple"],
  "14413": ["嘟嘟可故事集 (武器)", "purple"],
  "14414": ["白辰之环 (武器)", "purple"],
  "14415": ["证誓之明瞳 (武器)", "purple"],
  "14416": ["流浪的晚星 (武器)", "purple"],
  "14417": ["盈满之实 (武器)", "purple"],
  "14501": ["天空之卷 (武器)", "yellow"],
  "14502": ["四风原典 (武器)", "yellow"],
  "14503": ["[EN] - Lost Ballade (武器)", "yellow"],
  "14504": ["尘世之锁 (武器)", "yellow"],
  "14505": ["碧落之珑 (武器)", "yellow"],
  "14506": ["不灭月华 (武器)", "yellow"],
  "14508": ["[N/A] 4123950051 (武器)", "yellow"],
  "14509": ["神乐之真意 (武器)", "yellow"],
  "14511": ["千夜浮梦 (武器)", "yellow"],
  "14512": ["图莱杜拉的回忆 (武器)", "yellow"],
  "15301": ["鸦羽弓 (武器)", "blue"],
  "15302": ["神射手之誓 (武器)", "blue"],
  "15303": ["反曲弓 (武器)", "blue"],
  "15304": ["弹弓 (武器)", "blue"],
  "15305": ["信使 (武器)", "blue"],
  "15306": ["黑檀弓 (武器)", "blue"],
  "15401": ["西风猎弓 (武器)", "purple"],
  "15402": ["绝弦 (武器)", "purple"],
  "15403": ["祭礼弓 (武器)", "purple"],
  "15404": ["宗室长弓 (武器)", "purple"],
  "15405": ["弓藏 (武器)", "purple"],
  "15406": ["试作澹月 (武器)", "purple"],
  "15407": ["钢轮弓 (武器)", "purple"],
  "15408": ["黑岩战弓 (武器)", "purple"],
  "15409": ["苍翠猎弓 (武器)", "purple"],
  "15410": ["暗巷猎手 (武器)", "purple"],
  "15411": ["落霞 (武器)", "purple"],
  "15412": ["幽夜华尔兹 (武器)", "purple"],
  "15413": ["风花之颂 (武器)", "purple"],
  "15414": ["破魔之弓 (武器)", "purple"],
  "15415": ["掠食者 (武器)", "purple"],
  "15416": ["曚云之月 (武器)", "purple"],
  "15417": ["王下近侍 (武器)", "purple"],
  "15418": ["竭泽 (武器)", "purple"],
  "15501": ["天空之翼 (武器)", "yellow"],
  "15502": ["阿莫斯之弓 (武器)", "yellow"],
  "15503": ["终末嗟叹之诗 (武器)", "yellow"],
  "15504": ["[EN] - Kunwu's Wyrmbane (武器)", "yellow"],
  "15505": ["[EN] - Primordial Jade Vista (武器)", "yellow"],
  "15506": ["[EN] - Mirror Breaker (武器)", "yellow"],
  "15507": ["冬极白星 (武器)", "yellow"],
  "15508": ["若水 (武器)", "yellow"],
  "15509": ["飞雷之弦振 (武器)", "yellow"],
  "15511": ["猎人之径 (武器)", "yellow"],
  "200": "常驻祈愿",
  "301": "角色活动祈愿",
  "400": "角色活动祈愿-2",
  "302": "武器活动祈愿"
};

router.post("/", function (req, res, next) {
  let UID = req.body.username; // 从请求体中获取用户名
  // 转为数字
  if(!isNaN(parseFloat(UID)) && isFinite(UID)){
    UID = parseInt(UID);
  }else{
    res.send({
      code: 400,
      msg: "请输入正确的用户名"
    });
    return;
  }
(async function () {
  
  let client;
  try {
    // Connect to the MongoDB cluster
    client = await MongoClient.connect(url);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
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

    let lastYellowIndex301 = -1; // 记录最近一个yellow物品的索引
    let lastYellowIndex302 = -1; // 记录最近一个yellow物品的索引
    let lastYellowIndex100 = -1; // 记录最近一个yellow物品的索引
    let lastYellowIndex400 = -1; // 记录最近一个yellow物品的索引
    let lastYellowIndex200 = -1; // 记录最近一个yellow物品的索引

    let yellowItems301 = []; // 保存yellow物品的键和值
    let yellowItems302 = [];
    let yellowItems100 = [];
    let yellowItems400 = [];
    let yellowItems200 = [];

    let intervals301 = []; // 保存两个yellow物品间的间隔
    let intervals302 = []; // 保存两个yellow物品间的间隔
    let intervals100 = []; // 保存两个yellow物品间的间隔
    let intervals400 = []; // 保存两个yellow物品间的间隔
    let intervals200 = []; // 保存两个yellow物品间的间隔

    let postYellowCount301 = 0; // 在最后一个yellow物品之后的记录数量
    let postYellowCount302 = 0; // 在最后一个yellow物品之后的记录数量
    let postYellowCount100 = 0; // 在最后一个yellow物品之后的记录数量
    let postYellowCount400 = 0; // 在最后一个yellow物品之后的记录数量
    let postYellowCount200 = 0; // 在最后一个yellow物品之后的记录数量

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

    // console.log(UID); // 打印查询结果

    // router.get('/', function (req, res, next) {
      // 直接传递users对象，无需转换为字符串
      // console.log("数据发送成功");
      res.render('user', {
        code: '200',
        yellowItemsCount301: yellowItems301.length, //出金总数
        yellowItemsCount302: yellowItems302.length,
        yellowItemsCount100: yellowItems100.length,
        yellowItemsCount400: yellowItems400.length,
        yellowItemsCount200: yellowItems200.length,
        yellowItems301: yellowItems301, //卡池出金详情
        yellowItems302: yellowItems302,
        yellowItems100: yellowItems100,
        yellowItems400: yellowItems400,
        yellowItems200: yellowItems200,
        intervals301: intervals301, //间隔几抽出金
        intervals302: intervals302,
        intervals100: intervals100,
        intervals400: intervals400,
        intervals200: intervals200,
        postYellowCount301: postYellowCount301, //最后抽出金之后，垫了几抽
        postYellowCount302: postYellowCount302,
        postYellowCount100: postYellowCount100,
        postYellowCount400: postYellowCount400,
        postYellowCount200: postYellowCount200,
      });
    // });

  } finally {
    // Close connection
    await client.close();
  }
})();
});
router.get("/", function (req, res, next) {
  // const username = req.body.username; // 从请求体中获取用户名
  res.render('user', {
    title: 'Users List',
  });
});
// router.post("/", function (req, res, next) {
//   const username = req.body.username; // 从请求体中获取用户名
//   if (username) {
//     console.log(`你好, ${username}!`);
//     // 你可以选择在这里发送响应，或者在后续的逻辑中处理
//     // res.send(`你好, ${username}!`);
//   } else {
//     console.log('请输入用户名！');
//     // 同样，可以选择发送错误响应或处理缺失的用户名情况
//     // res.status(400).send('请输入用户名！');
//   }
// });
//  ////////
// var users = {
//   name: "张三",
//   age: 18
// };
// users = JSON.parse(users);
// users = JSON.stringify(users);

/* GET users listing. */
// router.get('/', function (req, res, next) {
//   // res.send('respond with a resource');
//   res.render('user', { title: 'Express', jsonData: JSON.stringify(gachas) });
//   // res.json(users);
// });
// console.log(gachas);
// strrr.replace("'","");
module.exports = router;