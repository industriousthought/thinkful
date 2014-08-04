var http = require('http');
var url = require('url');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var qs = require('querystring');

var root = __dirname;
var items = [];

var server = http.createServer(function (req, res) {

    var sendFile = function(u) {
	if (u) {
		req.url = u;
	}
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
    };
    
	var existingID = function(ifValid) {
		var pathname = url.parse(req.url).pathname;
	    console.log('PATHNAME --'  + pathname);
	    
		if (pathname) {
		    res.statusCode = 400;
		    res.end('Item id not valid');
		}
		else if (!items[pathname]) {
		    res.statusCode = 404;
		    res.end('Item not found');
		}
		else {
	            ifValid(pathname);	
		}

	};

	var getRequest = function(useItem) {
		var request = '';
		req.setEncoding('utf8');
		req.on('data', function (chunk) {
		    request += chunk;
		});
		req.on('end', function() { 
			useItem(request);
		});
	};
	
	var addItem = function(item, callback) {
	    var obj = qs.parse(item);
	    items[obj.item] = obj;
	    callback();
	};
	
	var sendItem = function(item) {
	    var msg = qs.stringify(item);
	    res.end(msg);
	};

        switch(req.method) {
        case 'GET':
		if(req.url == '/') {
			sendFile('/index.html');
		} else {

                if(req.url === '/list') {
                    console.log('lisyt!!!');
                    sendItem(items);
                } else {
                    sendFile();
                }
		}
            break;
            case 'POST':
                getRequest(function (request) {
			addItem(request, function() {
				sendFile('/index.html');
			});
                });
            break;

	    case 'PUT':
		    getRequest(function (request) {
		        var keys = request.split(',');
		        
		        existingID(function(id) { 
			        addItem(request, function() {
				    res.end('true');
				});
		        });
		    });
	    break;
	    case 'DELETE':
		    existingID(function(id) { 
			    delete items[id]; 
			    sendFile('/index.html');
		    });
	    break;
	}
});

server.listen(9000, function(){
   console.log('listening on 9000');
});
