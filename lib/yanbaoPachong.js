const puppeteer = require('puppeteer');
const cheerio=require('cheerio');
var moment=require('moment');

var db=require('./db.js');
var cf=require('./config.js');
var ku=require('./ku.js');
const { resolve } = require('bluebird');

// 移动版慧博
// 获取
exports.m_huibo=async function(){
	
	// 构造爬取地址
	var home='http://m.hibor.com.cn/';
	var arr=[];
	for(let i=15;i<=30;i++){
		let u={}
		u.url='http://m.hibor.com.cn/DocList?docType=1&pageIndex='+i;		
		u.urlpage=i;
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
		const $ = cheerio.load(t);
		const dt=moment().format('YYYY-MM-DD HH:mm:ss');
		$('.doc-info').each(function(){			

			var title = $(this).find('a').text();
			console.log(title);
			var url = $(this).find('a').attr('href');
			var comment = $(this).find('.doc-comment').text();
			var totalpage = $(this).find('.doc-comment').next().text();
			totalpage=totalpage.replace('页','').replace(/\s*/g,"");
			if(totalpage==''){
				totalpage=0;
			}
			// console.log(title);
			// console.log(link);
			// console.log(comment);
			// console.log(totalpage);
			if(title!=''){				
				var r={};
				r.urlpage=v.urlpage;
				r.title=title;
				r.url=url;
				r.comment=comment;
				r.totalpage=totalpage;
				result.push(r);
			}
		})		
	}
	await browser.close();	

	// 三、把数据插入数据库中（循环插入，一个一个插入）；	
	var count=0;
	for(let v of result){
		count=count+1;
		console.log(count+'次开始逐条插入');
		
		// 判断数据库中是否有
		await ku.wait(3000);
		let d3=await db.query('m100',[v.title,v.url]);
		// console.log(d3);
		if(d3.length>0){
			console.log(count+'次failed,原因：数据库记录已存在');
		}else{
			console.log(count+'次调用insertOne');		
			await insertOne(v);
		}
	}
	console.log('处理完成');
};


insertOne= async function (v){	

		var j={};
		var str=v.title;
		var arr=str.split("-");
		if(arr.length==5 && wordtest(arr[0]) && arr[4].length==6){}else{			
			console.log('异常数据(格式不对1)：',v.title);
			return resolve;
		}

		j.title=v.title;
		j.url=v.url;
		j.comment=v.comment;
		j.totalpage=v.totalpage;
		j.quanshang=arr[0];
		j.stockname=arr[1];
		j.stockcode=arr[2];
		j.titleb=arr[3];
		var d='20'+arr[4].substr(0,2)+'/'+arr[4].substr(2,2)+'/'+arr[4].substr(4,2);
		// console.log(d);
		// console.log(new Date(d));
		j.yanbaodate=new Date(d);
		j.washcode=1;

		if(j.yanbaodate instanceof Date){}else{			
			console.log('异常数据(格式不对2)：',v.title);
			return resolve;
		}

		ku.wait(3000);
		const r3=await db.query('m122',j);
		if(r3.affectedRows>0){
			console.log('插入success');
		}else{
			console.log('插入失败2：',v.title);
		}
		return resolve;
}

function wordtest(str){
	var arr=['华西证券',
		'安信证券',
		'民生证券',
		'天风证券',
		'国金证券',
		'华创证券',
		'浙商证券',
		'华泰证券',
		'东北证券',
		'西南证券',
		'东方证券',
		'中泰证券',
		'山西证券',
		'光大证券',
		'信达证券',
		'银河证券',
		'长城证券',
		'东吴证券',
		'开源证券',
		'东莞证券',
		'中银国际',
		'平安证券',
		'东兴证券',
		'西部证券',
		'太平洋证券',
		'新时代证券',
		'国信证券',
		'国联证券',
		'广证恒生',
		'中原证券',
		'国海证券',
		'财信证券',
		'渤海证券',
		'中航证券',
		'粤开证券',
		'万联证券',
		'上海证券',
		'华鑫证券',
		'华金证券',
		'申港证券',
		'国元证券',
		'世纪证券',
		'财富证券',
		'招银国际',
		'财通证券',
		'国融证券',
		'中达证券',
		'华安证券',
		'长城国瑞证券',
		'兴证证券',
		'华宝证券',
		'东海证券',
		'万和证券',
		'国开证券',
		'红塔证券',
		'首创证券',
		'南京证券',
		'联讯证券',
		'网信证券',
		'太平洋',
		'国都证券',
		'爱建证券',
		'国金证券',
		'国际证券',
		'中投建投',
		'中银国际', 
		'东方证券',
		'建银国际',
		'财达证券',
		'中邮证券',
		'华融证券',
		'中信建设',
		'新时达证券',
		'银河',
		'国金',
		'广州恒生',
		'平安证券',
		'中信',
		'天平洋证券',
		'国海证券', 
		'君安',
		'莫尼塔'
		]

	var re=false;

	for(var i=0;i<arr.length;i++){
		if(str.indexOf(arr[i])>-1){
			re=true;
			break;
		}
	}
	// console.log(re);
	return re;
}



