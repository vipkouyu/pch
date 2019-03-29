
var moment=require('moment');
var schedule = require('node-schedule');

var test=require('./lib/test.js');
var un=require('./lib/un.js');

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
//爬取【什么值得买】前20页链接，运行时间：每6个小时一次，函数pc.smzdm();
//根据【什么值得买】每个链接，爬取每个页面的内容，运行时间：每1个小时一次，函数pc.getContent();

// 删除多余的数据：每天运行一次，函数pc.deleteOverdue();
// 

//****************************

//每4个小时运行一次(59分钟)
schedule.scheduleJob(' 11 * * * *', function(){
	console.log('爬虫：smzdm()，每4个小时运行一次');
	console.log('运行时间：'+moment().format('YYYY-MM-DD HH:mm:ss'));
	test.smzdm();
});