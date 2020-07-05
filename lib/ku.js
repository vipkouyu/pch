var moment=require('moment');


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

exports.getDatetime=function(){
 return moment().format('YYYY-MM-DD HH:mm:ss');
}

exports.wait=async function(time){
	
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    })  
}


