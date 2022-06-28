const puppeteer = require('puppeteer');
const cheerio=require('cheerio');
var moment=require('moment');

var db=require('./db.js');
var cf=require('./config.js');
var ku=require('./ku.js');
const { resolve } = require('bluebird');

// 移动版慧博
// 获取
exports.getinfo=async function(){

	let coin=await db.query('m110',[100]);
	console.log(coin);


	
	// 构造爬取地址
	var home='https://coinmarketcap.com/currencies/';
	var arr=[];
	for(let i=0;i<coin.length;i++){
		let u={}
		console.log(coin[i].slug);
		u.url='https://coinmarketcap.com/currencies/'+coin[i].slug;
		u.urlpage = i;
		u.id = coin[i].id;
		arr.push(u);
	}
	
	// console.log('push后的数组：arr');
	// console.log(arr);
	//二、取得所有的refid;
	const browser = await puppeteer.launch({
		executablePath: './chrome/chrome.exe',
		headless:false
	});
	const page = await browser.newPage();
	await page.setViewport({
		 width:1600,
		 height:1200
	});
	await page.setUserAgent("Mozilla/5.0 (Windows NT 6.1;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36");

	// 一、登陆
	await page.goto(home);
	await page.waitFor(19999);

	// 二、爬取个股研报
	let result=[];	
	for(let v of arr){		
		console.log('读取第'+v.urlpage+'页');
		await page.goto(v.url);
		console.log('等待1分半钟');
		await ku.wait(30000);
		
		var t=await page.content();
		var watchlist=0;
		const $ = cheerio.load(t);

		$('#__next').each(function(){

			var w=$(this).find('.namePill').text();
			// console.log(w);
			var b=w.indexOf('TokenOn');
			var e=w.indexOf('watchlists');
			var ss= w.slice(b,e);
			ss= ss.slice(8);
			watchlist=ss.trim();
			// console.log(watchlist);

		})

		let r1 = await db.query('m120',[watchlist,v.id]);
		// console.log(r1);
			
		
	}
	await browser.close();	
	console.log('处理完成');
};







