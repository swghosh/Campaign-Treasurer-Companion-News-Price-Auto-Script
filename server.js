var http = require('http');
var fs = require('fs');

var scriptFile1 = JSON.parse(fs.readFileSync('file1.json', 'utf8'));
var scriptFile2 = JSON.parse(fs.readFileSync('file1.json', 'utf8'));

var handle = function(request, response) {
    console.log(request.url, "was requested");

    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World');
};

http.createServer(handle).listen(8080);