var http = require('http');
var fs = require('fs');

var posters = require('./posters.js');

var scriptOneSwitch = false;
var scriptTwoSwitch = false;

var durationNewsAndPrice = 20000;

var scriptFileOne = JSON.parse(fs.readFileSync('/home/ubuntu/campaigntreasurercompanionnewsscript/file1.json', 'utf8'));
var scriptFileTwo = JSON.parse(fs.readFileSync('/home/ubuntu/campaigntreasurercompanionnewsscript/file2.json', 'utf8'));

var handle = function(request, response) {
    console.log(request.url, "was requested");
    if(request.url == '/start1') {
        var index = 0;
        for(var i in scriptOne) {
           setTimeout(() => {
                updater(scriptOne[index].news, scriptOne[index].percentage, scriptOne[index++].item);
           }, scriptOne[i].timeId * 60 * 1000);
        }
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Script 1 started');
    }
    else if(request.url == '/start2') {
        var index = 0;
        for(var i in scriptTwo) {
           setTimeout(() => {
                updater(scriptTwo[index].news, scriptTwo[index].percentage, scriptTwo[index++].item);
           }, scriptTwo[i].timeId * 60 * 1000);
        }
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Script 2 started');
    }
    else if(request.url == '/stop') {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Host is off now!');
        server.close();
    }
    else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Host is up and doing!');
    }
};

var server = http.createServer(handle).listen(8080);

var scriptOne = [];

for(var index in scriptFileOne) {
    var script = scriptFileOne[index];

    scriptOne[index] = {};
    scriptOne[index].news = script[0];
    scriptOne[index].timeId = script[1];
    scriptOne[index].percentage = script[2];
    scriptOne[index].item = script[3];

    if(scriptOne[index].percentage.trim().endsWith('DOWN')) {
        scriptOne[index].percentage = - parseFloat(scriptOne[index].percentage);
    }
    else {
        scriptOne[index].percentage = parseFloat(scriptOne[index].percentage);
    }


}

var scriptTwo = [];

for(var index in scriptFileTwo) {
    var script = scriptFileTwo[index];

    scriptTwo[index] = {};
    scriptTwo[index].news = script[0];
    scriptTwo[index].timeId = script[1];
    scriptTwo[index].percentage = script[2];
    scriptTwo[index].item = script[3];

    if(scriptTwo[index].percentage.trim().endsWith('DOWN')) {
        scriptTwo[index].percentage = - parseFloat(scriptTwo[index].percentage);
    }
    else {
        percentage = parseFloat(scriptTwo[index].percentage);
    }
}

var updater = function(news, percentage, item) {
    posters.postNews(news, (output) => { });
    setTimeout(() => {
        posters.priceOf(item, (value) => {
            var difference = (value * percentage) / 100;
            var newPrice = value + difference;
            posters.updatePrice(item, newPrice, (output) => { });
        });
    }, durationNewsAndPrice);
};