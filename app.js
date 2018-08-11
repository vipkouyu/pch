const puppeteer = require('puppeteer');
const cheerio=require('cheerio');


(async () => {
	const browser = await puppeteer.launch({
		executablePath: './chrome/chrome.exe',
		headless:false
	});
	const page = await browser.newPage();
	await page.setViewport({
		 width:1600,
		 height:1200
	})
	await page.goto('https://faxian.smzdm.com/h4s0t0f0c0p1/#filter-block',{
		timeout:90000,
		waitUntil:'networkidle2'
	});
	await page.screenshot({path: 'example.png'});
	var t=await page.content();

	const $ = cheerio.load(t);

	$('.feed-ver-title').each(function(){
		console.log($(this).text());
	})



	// console.log(t);



	await browser.close();
})();