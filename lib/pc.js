const puppeteer = require('puppeteer');
const cheerio=require('cheerio');


var db=require('./db.js');
var cf=require('./config.js');
var ku=require('./ku.js');


exports.done=async function(){
	//每天（不定期）跑爬虫；
	//算法如下：
	//一、抓取页面首页所有文章（文章标题，链接），存储在数据库中
	//二、存取前判断是否存在，若不存在则插入

	// 一、构造链接;
	let arr=await db.query('p01',[]);

	//二、取得所有的refid;	
	const browser = await puppeteer.launch({
		execwaitablePath: './chrome/chrome.exe',
		headless:false
	});
	const page = await browser.newPage();
	await page.setViewport({
		 width:1600,
		 height:1200
	});
	await page.setUserAgent("Mozilla/5.0 (Windows NT 6.1;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36");
	
	
	for(let v of arr){

		// 保存结果
		let result=[];
		const name=v.name;

		// 一、加载浏览器
		await page.goto(v.url,{
			timeowait:90000,
			// waitUntil:'networkidle2'
		});
		console.log('等90秒');
		await  page.waitFor(90000);
		console.log('90秒结束');

		// 二、取DOM中的内容
		const html=await page.content();
		const re=getPost(html,v.url);
		for(var i=0;i<re.length;i++){
			re[i].datetime=ku.getDatetime();
			result.push(re[i]);
		}

		// 三、往数据库中插入数据
		let count=0;
		for(v of result){
			console.log('暂停5秒,start');
			await ku.wait(3000);
			console.log('暂停5秒,end');
			const r1=await db.query('p10',v.url);
			if(r1.length>0){}else{
				const r2=await db.query('p11',['pccontent',v]);
				if(r2.insertId>0){
					count++;
				}
			}
		}

		// 四、往日志中写入输入
		let log={};
		log.log='爬取对象：【'+ name +'】，总文章数量为：'+result.length+',新插入文章数为：'+count;
		log.type='a';
		log.datetime=ku.getDatetime();
		await db.query('p11',['log',log]);
		
	}	
	await browser.close();
};


async function scrollToBottom(){
	await page.evaluate(_ => {
			window.scrollBy(0, window.innerHeight);
	});
}

// 两个参数：html和link
function getPost(html,url){
	let arr=[];
	const $ = cheerio.load(html);
	// 知乎专栏
	// 格式：https://zhuanlan.zhihu.com/banmaxiaofei
	if(url.indexOf('zhuanlan.zhihu.com')>0){
		$('.ContentItem-title>a').each(function(){
			let j={};
			j.url=$(this).attr('href');
			j.title=$(this).text();;
			arr.push(j);
			// 输出结果
			console.log(j);
		})
	}
	// 雪球专栏
	// 格式：https://xueqiu.com/6846764169/column
	if(url.indexOf('xueqiu.com')>0 && url.indexOf('column')>0){
		$('.column__item__title>a').each(function(){
			let j={};
			j.url='https://xueqiu.com'+$(this).attr('href');
			j.title=$(this).text();
			arr.push(j);
			// 输出结果
			console.log(j);
		})
	}
	// 返回结果
	return arr;
}


