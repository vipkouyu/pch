var request = require('request');
var Promise = require("bluebird");

const puppeteer = require('puppeteer');
const cheerio=require('cheerio');

var moment=require('moment');
var db=require('./db.js');
var cf=require('./config.js');
var ku=require('./ku.js');

// 取联盟link
exports.getUnlink=async function (){

	console.log('开始读取----远程数据库');
	var d= await db.query('pc060',[]);
	// console.log(d);
	console.log('已读取---远程数据库');
	// console.log(d);
	if(d !='' && d.length >0){
		for(let v of d){
			// 判断是否是京东
			try{
				var s=v.link2;
				if(s.indexOf('jd.com/')>0){
					var mID = s.substring(s.indexOf('jd.com/')+7,s.indexOf('.html'));
					console.log(mID);

					if(/^[0-9]+$/.test(mID)){
						// 取得JD推广链接；
						var u=await jd_url(mID);
						var a=await accessWeb(u);
						let j1=JSON.parse(a);
						let j2=JSON.parse(j1.jingdong_service_promotion_getcode_responce.queryjs_result);					
						let r1=j1.jingdong_service_promotion_getcode_responce.code;
						let r2=j2.resultCode;
						let r3=j2.resultMessage;
						let r4=j2.url;
						// console.log(r1);
						// console.log(r2);
						// console.log(r3);
						// console.log(r4);
						console.log('1');
						if(r1==0 && r2==0){
							await db.query('pc061',[r4,v.id]);
							console.log('更新联盟链接成功');
						}
					}
				}
			}catch(e) {
				console.log('取联盟url出错，出错原因：'+e);
			}
		}
	}
}



function jd_url(mID){
	// 输入参数为京东商品ID

	var appkey='2E0BD974C6543A2776E7422381D935D9';
	var appsecret='8b890f68c6b34041acb4a6d9f06e98db';
	var apptoken='94909a78-a17a-4128-82d9-4680ff302164';

	var m_url="https://item.jd.com/"+mID+".html";

	var appjson={
		"adttype":"6",
		"channel":"PC",
		"materialId":m_url,
		"promotionType":7,
		"unionId":1000611387,
		"webId":1450389103
	};

	var s='adttype'+'6'+'channel'+'PC'+'materialId'+
	m_url+'promotionType'+'7'+'unionId'+'1000611387'+'webId'+'1450389103';

	var appsign=ku.md5(appsecret+s+appsecret).toUpperCase();

	var url='https://api.jd.com/routerjson?v=2.0'+
		'&method=jingdong.service.promotion.getcode'+
		'&app_key='+appkey+
		'&access_token='+apptoken+
		'&360buy_param_json='+JSON.stringify(appjson)+
		'&timestamp='+moment().format('YYYY-MM-DD HH:mm:ss')+
		'&sign='+appsign;

	// console.log(url);
	return url;
}

// 爬淘宝
exports.getTaobao=async function (){

	var link='https://s.click.taobao.com/t?e=m%3D2%26s%3DWwRFNJYDkhscQipKwQzePOeEDrYVVa64pRe%2F8jaAHci5VBFTL4hn2Y4VsiyapGq4wg1qdhPjl1RuOnUmREj28R%2BpFLffM3GM36LhF4Dya1zRE4ZlDqfmlR1u6NgnO21O43szIcafZWQHewJ7FOdJUfb1uzZ4TP6oxg5p7bh%2BFbQ%3D';

	console.log('开始爬淘宝');	
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
		
		try{
			await page.goto(link,{
				timeout:90000,
				waitUntil:'networkidle2'
			});

			await  page.waitFor(9999);
			var t=await page.content();
			var u= await page.url();

			// 链接为u
			console.log(u);

			await page.goto('https://pub.alimama.com',{
				timeout:90000,
				waitUntil:'networkidle2'
			});
			await  page.waitFor(9999);

			// 用户名为：TPL_username_1
			// 密码为：TPL_password_1
			// form为：J_Form
			// 按钮：J_SubmitStatic
                                      
                                     const frame = await page.frames().find(f => f.name() === 'taobaoLoginIfr');
			await frame.click('#J_Quick2Static');
			await  page.waitFor(5000);

			await frame.click('#TPL_username_1');
			await  page.waitFor(5000);
			await frame.$eval('#TPL_username_1', el => el.value = 'bdzbmdotcom');

			await frame.click('#TPL_password_1');
			await frame.$eval('#TPL_password_1', el => el.value = '35254282tbb');
			await  page.waitFor(5000);

			await frame.click('#J_SubmitStatic');

			await  page.waitFor(5000);




			// const $ = cheerio.load(t);

			// if($('div.article-right').hasClass('soldOut')){
			// 	continue; 
			// }
			// var re={};
			// re.wz='smzdm';
			// re.reflink=v.reflink;
			// re.webname=v.webname;
			// re.createtime=moment().format('YYYY-MM-DD HH:mm:ss');
			// //取smzdm标题，然后在wash title
			// re.title=ku.washtitle($('div.article-right .main-title').text()+'&nbsp;&nbsp;&nbsp;'+$('div.article-right .red').text());

			// //取smzdm内容，
			// var s=$('.item-box .inner-block').text()+$('.item-box .baoliao-block').text();
			// re.content=ku.washcontent(s);

			// //取留言数量
			// re.commentno=$('#leftLayer .commentNum').text();
			// re.zanno=ku.washtitle($('#rating_worthy_num').text());
			// re.buzanno=ku.washtitle($('#rating_unworthy_num').text());
			// re.gotolink=$('.article-top-box').children('a').attr('href');
			// re.pic=$('.article-top-box').children('a').children('img').attr('src');
			// // console.log(re);
		
		
			// //存储到数据库中
			// console.log('远程数据库---开始存储---爬取的数据');
			// var c=await db.query('pc020',re);
			// console.log('远程数据库---已存储---爬取的数据');
			// // console.log(c.affectedRows);
			// // console.log(c.insertId);
			// console.log('远程数据库---标记---URL被爬取');
			// if(c.affectedRows==1 && c.insertId >0){
			// 	db.query('pc021',v.reflink);
			// }
			// console.log('远程数据库---标记完毕---URL被爬取');
		}catch(e) {
			console.log('存储出错了,错误原因为：'+e);
		}
		
		await browser.close();
	
}


// request 封装为异步函数
async function accessWeb(url){

	return new Promise(function(resolve, reject){
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				// console.log(body);
				resolve(body)
			}else{
				reject(error);
			}
		})

	})
}