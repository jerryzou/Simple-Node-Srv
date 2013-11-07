//JIT.NodeJS Webserver

//Initialize NodeJS modules
var http = require("http"), url = require("url"), fs = require("fs"), path = require("path"), zlib = require("zlib");

//Initialize internal modules
var config = require("./config"), mime = require("./mime").types, postHandler = require("./posthandler");

//Create http server instance
var server = http.createServer(function(req, res){
	//console.time('Fetch complete');
	var realDir = config.domainMap[req.headers.host] || config.constant.defaultDir;
	var pathName = url.parse(req.url).pathname;
	console.log("Request for " + pathName + " is received.");
	if(pathName.slice(-1)==="/"){
		pathName = pathName + config.constant.defaultPage;
	}
	var realPath = path.join(realDir, pathName.replace("..",""));

	if(pathName==="/jnspost"){
		postHandler.mainHandler(req, res);
	}else{
		var pathHandle = function(realPath){
			fs.stat(realPath,function(err,stat){
				res.setHeader("Server",config.constant.serverName)
				if(err){
					res.writeHead(404,{"Content-Type":"text/plain"});
					res.write(pathName + " does not exist on this server.");
					res.end();
				}else{
					if(stat.isDirectory()){
						realPath = path.join(realPath, "/", config.constant.defaultPage);
						pathHandle(realPath);
					}else{
						var extName = path.extname(realPath);
						extName = extName ? extName.slice(1) : 'unknown';
						var contentType = mime[extName] || "text/plain";
						res.setHeader("Content-Type",contentType);

						var lastModified = stat.mtime.toUTCString();
						var ifModifiedSince = "If-Modified-Since".toLowerCase();
						res.setHeader("Last-Modified",lastModified);

						if(extName.match(config.Expires.fileMatch)){
							var expires = new Date();
							expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
							res.setHeader("Expires",expires.toUTCString());
							res.setHeader("Cache-Control","max-age=" + config.Expires.maxAge);
						}

						if(req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]){
							res.writeHead(304,"Not Modified");
							res.end();
						}else{
							var raw = fs.createReadStream(realPath);
							var acceptEncoding = req.headers['accept-encoding'] || "";
							var matched = extName.match(config.Compress.fileMatch);

							if (matched && acceptEncoding.match(/\bgzip\b/)) {
							    res.writeHead(200, "Ok", {'Content-Encoding': 'gzip'});
							    raw.pipe(zlib.createGzip()).pipe(res);
							} else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
							    res.writeHead(200, "Ok", {'Content-Encoding': 'deflate'});
							    raw.pipe(zlib.createDeflate()).pipe(res);
							} else {
							    res.writeHead(200, "Ok");
							    raw.pipe(res);
							}
						}
					}
				}
			});
		};

		pathHandle(realPath);
	}
	//console.timeEnd('Fetch complete');
});

//register listener
server.listen(config.constant.port);

//report server start status
console.log(config.constant.serverName + " is running at port " + config.constant.port + "...");