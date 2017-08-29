var http = require('http');
var fs = require('fs');

var posters = require('./posters.js');

var scriptOneSwitch = false;
var scriptTwoSwitch = false;

var durationNewsAndPrice = 20000;

var scriptFileOne = JSON.parse(fs.readFileSync('/home/ubuntu/campaigntreasurercompanionnewsscript/file1.json', 'utf8'));
var scriptFileTwo = JSON.parse(fs.readFileSync('/home/ubuntu/campaigntreasurercompanionnewsscript/file1.json', 'utf8'));

var handle = function(request, response) {
    console.log(request.url, "was requested");
    if(request.url == '/start1') {

    }
    else if(request.url == '/start2') {

    }
    else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Hello World');
    }
};

http.createServer(handle).listen(8080);

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

var updater = function(script) {
    posters.postNews(script.news, (output) => { });
    setTimeout(() => {
        posters.priceOf(script.item, (value) => {
            var difference = (value * script.percentage) / 100;
            var newPrice = value + difference;
            posters.updatePrice(script.item, newPrice, (output) => { });
        });
    }, durationNewsAndPrice);
};