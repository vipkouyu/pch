
var moment=require('moment');
var schedule = require('node-schedule');

var pc=require('./lib/pc.js');

//scheduleJob使用说明
//*    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

//****************************
//自动执行的的job列表
//爬取【什么值得买】前20页链接，运行时间：每6个小时一次
//根据【什么值得买】每个链接，爬取每个页面的内容，运行时间：每1个小时一次

//****************************

// schedule.scheduleJob('*/2 * * * *', function(){
// 	console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
// });


// pc.smzdm();
pc.getContent();







