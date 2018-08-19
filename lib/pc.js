const puppeteer = require('puppeteer');
const cheerio=require('cheerio');
var moment=require('moment');
var schedule = require('node-schedule');

var db=require('./lib/db.js');
var cf=require('./lib/config.js');
var ku=require('./lib/ku.js');



async function smzdm(){
	//每天跑【什么值得买】前20页；
	//算法如下：
	//一、构造20页的URL；
	//二、取得所有refid；
	//三、在数据库中判断哪些已经存在；
	//四、请求每个页面；
	//五、把数据存储在数据库中；

	// 一、构造20页的URL;
	var arr=[];
	for(let i=1;i<=2;i++){
		let u='https://faxian.smzdm.com/h4s0t0f0c0p'+i+'/#filter-block';		
		arr.push(u);
	}
	console.log('push后的数组：arr');
	console.log(arr);
	//二、取得所有的refid;
	let result=[];
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
	
	for(let v of arr){		
		await page.goto(v,{
			timeout:90000,
			waitUntil:'networkidle2'
		});
		await  page.waitFor(9999);		
		var t=await page.content();

		const $ = cheerio.load(t);
		const dt=moment().format('YYYY-MM-DD HH:mm:ss');
		$('#feed-main-list>li').each(function(){
			// console.log($(this).find('.feed-ver-title').text());   //取描述
			// console.log($(this).find('.feed-ver-title').children('a').attr('href'));
			var t=[$(this).find('.feed-ver-title').children('a').attr('href'),'smzdm',dt];
			result.push(t);
		})
	}
	console.log('push后的数组：result');
	console.log(result);

	await browser.close();

	// 三、把数据插入数据库中；
            for(let v of result){
		await db.query2('CALL saveurl(?,?,?);',[v[0],v[1],v[2]]);
            }		
};

async function scrollToBottom(){
	await page.evaluate(_ => {		
			window.scrollBy(0, window.innerHeight);
	});
}

async function getContent(){
	console.log('开始读取----远程数据库');
	var d= await db.query('pc010',[]);
	// console.log(d);
	console.log('已读取---远程数据库');

	if(d !='' && d.length >0){
		//打开浏览器
		console.log('打开浏览器');
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

		//一个一个爬网页
		for(let v of d){				
			await page.goto(v.reflink,{
				timeout:90000,
				waitUntil:'networkidle2'
			});

			await  page.waitFor(9999);		
			var t=await page.content();

			const $ = cheerio.load(t);

			var re={};
			re.wz='smzdm';
			re.reflink=v.reflink;
			re.createtime=moment().format('YYYY-MM-DD HH:mm:ss');
			//取smzdm标题，然后在wash title
			re.title=ku.washtitle($('div.article-right .main-title').text()+'&nbsp;&nbsp;&nbsp;'+$('div.article-right .red').text());

			//取smzdm内容，
			var s=$('.item-box .inner-block').text()+$('.item-box .baoliao-block').text();
			re.content=ku.washcontent(s);

			//取留言数量
			re.commentno=$('#leftLayer .commentNum').text();
			re.zanno=ku.washtitle($('#rating_worthy_num').text());
			re.buzanno=ku.washtitle($('#rating_unworthy_num').text());
			re.gotolink=$('.article-top-box').children('a').attr('href');
			re.pic=$('.article-top-box').children('a').children('img').attr('src');
			// console.log(re);

			//存储到数据库中
			console.log('远程数据库---开始存储---爬取的数据');
			var c=await db.query('pc020',re);
			console.log('远程数据库---已存储---爬取的数据');
			console.log(c.affectedRows);
			console.log(c.insertId);
			console.log('远程数据库---标记---URL被爬取');
			if(c.affectedRows==1 && c.insertId >0){
				db.query('pc021',v.reflink);
			}
			console.log('远程数据库---标记完毕---URL被爬取');


		}
		await browser.close();
	}
	
}