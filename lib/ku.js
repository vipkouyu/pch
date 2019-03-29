var crypto = require('crypto');


//获取链接
exports.washtitle=function(string){
	
	string = string.replace(/\r\n/g,"");   //去掉\r\n
	string = string.replace(/\n/g,"");     // 去掉\n
	string = string.replace(/\s/g,"");   //去掉\s

	return string;
}

exports.washcontent=function(string){
	
	string = string.replace(/\r\n/g,"<br>");   //去掉\r\n
	string = string.replace(/\n/g,"<br>");     // 去掉\n
	string = string.replace(/\s/g,"");   //去掉\s
	//去掉emoji字符
	// string = string.replace(/[\u0800-\uFFFF]/g, '');

	return string;
}


// 取MD5
exports.md5=function(text){
	return crypto.createHash('md5').update(text).digest('hex');
};

