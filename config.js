exports.constant = {
	port: 80,
	serverName: "JIT.NodeJS",
	defaultDir: "Default",
	defaultPage: "index.html",
};

exports.Expires = {
	fileMatch: /^(gif|png|jpg)$/ig,
	maxAge: 60*60*24*365
};

exports.Compress = {
	fileMatch: /css|js|html/ig
};

exports.domainMap = {
	"www.domain1.com": "Directory1",
	"www.domain2.com": "Directory2"
};