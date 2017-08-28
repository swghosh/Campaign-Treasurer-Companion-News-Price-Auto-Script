var http = require('http');

var handle = function(request, response) {
    console.log(request.url, "was requested");

    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World');
};

http.createServer(handle).listen(8080);