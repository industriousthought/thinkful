var http = require('http');
var url = require('url');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var qs = require('querystring');

var root = __dirname;
var items = [];

var getData = function(useItem) {
    var data = '';
    this.req.setEncoding('utf8');
    this.req.on('data', function (chunk) {
        data += chunk;
    });
    this.req.on('end', function() { 
        useItem(parseItem(data));
    });
};

var parseItem = function(item) {
    return qs.parse(item).data;
};

var addItem = function(item, callback) {
    items[item] = item;
    callback();
};

var sendItem = function(item) {
    var msg = qs.stringify(item);
    this.res.end(msg);
};

var sendFile = function(u) {
    if (u) {
        this.req.url = u;
    }
    var url = parse(this.req.url);
    var path = join(root, url.pathname);

    fs.stat(path, (function (err, stat) {
        if (err) {
            if (err === 'ENOENT') {
                this.res.statusCode = 404;
                this.res.end('File Not Found');
            }
            else {
                this.res.statusCode = 500;
                this.res.end('Internal Server Error');
            }
        }

        else {

            var stream = fs.createReadStream(path);

            this.res.setHeader('Content-Length', stat.size);
            stream.pipe(this.res);

            stream.on('error', (function (err) {

                this.res.statusCode = 500;

                this.res.end('Internal Server Error');

            }).bind(this));

        }

    }).bind(this));
};

var server = http.createServer(function (req, res) {
    this.req = req;
    this.res = res;
    
    sendItem = sendItem.bind(this);
    sendFile = sendFile.bind(this);
    getData = getData.bind(this);

    if (req.headers.verb) {
        req.method = req.headers.verb;
    }

    switch(req.method) {

        case 'GET':
            if(req.url === '/') {
                sendFile('/index.html');
            } else {

                if(req.url === '/list') {
                    sendItem(items);
                } else {
                    sendFile();
                }
            }
            break;
            
        case 'POST':
            getData(function (data) {
                addItem(data, function() {
                    res.end('true');
                });
            });
            break;

        case 'PUT':
            getData(function (data) {
                data = data.split(',');
                delete items[data[0]];
                addItem(data[1], function() {
                    res.end('true');
                });
            });
            break;

        case 'DELETE':
            getData(function (data) {
                delete items[data]; 
                res.end('true');
            });
            break;
    }
    console.log(items);
});

server.listen(9000, function(){
    console.log('listening on 9000');
});
