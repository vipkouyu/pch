var mysql=require("mysql");
var config = require("./config.js"); //引入mysql的配置信息
var Promise = require("bluebird");

//不知道什么意思
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

//创建数据库链接池
var pool = mysql.createPool({
	host : config.mysql.host,
	prot:  config.mysql.port,
	database: config.mysql.database,
	user:  config.mysql.user,
	password: config.mysql.password,
	connectionLimit: 20,              //数据库最大链接池为20；
	multipleStatements: true
});

function dboperate(str,para,option){
	return new Promise(function(resolve, reject){		
		pool.getConnection(function(err,connection){
			//console.log('数据库查询语句参数为：',para);
			if(err){
				console.log("从数据库链接池取得connection失败！");
			}else{
				//console.log("从数据库链接池取得connection成功！"); 
				connection.query(str,para,function(err,rows){
					if(err){
						console.log('进行了一次数据库操作，操作失败！');
						//下一行是为了Dubug
						//console.log(err);
						console.log('错误数据库语句为：');
						console.log(str);
						console.log('错误参数为：');
						console.log(para);
						reject(err);
					}else{
						//console.log('进行了一次数据库操作，操作成功！');
						//console.log('下一行是为了Dubug');//下一行是为了Dubug
						//console.log(rows);
						resolve(rows);
					}
				})
			//用完连接，释放掉，放回连接池
			connection.release();  //后续不应该再有代码；
			}
		})
	})
}

//*******************************//
//dboperate的参数为json格式
//【query】函数说明：
//1、querytype：表示数据库操作语句的编号，例如str11='insert into `baoliao` set ?';
//2、param：表示参数；
//3、op表示json格式和数据格式？？？？？？
//*******************************//
exports.query=function(querytype,param){

	var str=getQuerystr(querytype);
	var para=getPara(querytype,param);
	
	// console.log('数据库查询语句为：'+str);
	//console.log('数据库查询语句的参数为：',para);
	
	return dboperate(str,para);
}

//调用存储过程
exports.query2=function(querytype,param){
	// console.log('数据库查询语句为：'+querytype);
	// console.log('数据库查询语句的参数为：',param);
	return dboperate(querytype,param);
}

//根据【类型】返回【数据库查询语句】
function getQuerystr(type){
	var querystr='';

	if(type.indexOf('pc')>=0){
		
		switch(type){ 
			case 'pc001':   //通用查找操作
				querystr='select reflink from content where reflink in ?';
				break;
			case 'pc002':   //插入list
				querystr='insert into list(`reflink`,`wz`,`datetime`) VALUES ?';
				break;
			case 'pc010':   //取url（未标记x的）
				 querystr='select reflink from list where IFNULL(`bz`,"") != "x" limit 1';
				 break;
			case 'pc020':   //存储到数据库中
			             querystr='insert into content set ?';
			             break;
			case 'pc021':   //若爬到了数据，则更新list表，表示已经爬过了
			             querystr='update list set `bz`="x" where reflink=? ';
			             break;
			default:
				break;
		}
	}else{

	}	
	return querystr;
}

//根据【类型】返回【数据库参数】
function getPara(type,parameter){
	var para=parameter;
	//var d =new Date();

	switch(type){
		case 'str21':      //【爆料】--插入爆料内容			
			//para.date=d.toLocaleDateString(); 
			break;
		default:
			break;
	}
	return para;
}