var qs = require("querystring");

var handle = {}
handle["service1"] = service1;
handle["service2"] = service2;

function mainHandler(req, res){
	var postData = "";
	req.setEncoding("utf8");
	req.on("data",function(chunk){
		postData += chunk;
	});
	req.on("end",function(){
		if(typeof handle[qs.parse(postData).func] === "function" && req.headers['content-length']<5000){
			handle[qs.parse(postData).func](postData, res);
		}else{
			res.writeHead(404, {"Content-Type":"text/plain"});
			res.write("404 Not Found");
			res.end();
		}
	});
}

function service1(postData, res){
	
}

function service2(postData, res){
	
}

exports.mainHandler = mainHandler;