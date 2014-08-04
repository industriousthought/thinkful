var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');


var root = __dirname;

var server = http.createServer(function (req, res) {
	console.log('server!');
    var url = parse(req.url);
    var path = join(root, url.pathname);
    fs.stat(path, function (err, stat) {
        if (err) {
            if (err == 'ENOENT') {
                res.statusCode = 404;
                res.end('File Not Found');
            }
            else {
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        }
        else {
            var stream = fs.createReadStream(path);
            res.setHeader('Content-Length', stat.size);
            stream.pipe(res);
            stream.on('error', function (err) {
                res.statusCode = 500;
                res.end('Internal Server Error');
            });
        }
    });
});



server.listen(9000, null, null,  function(){
   console.log('listening on 9000');
});
