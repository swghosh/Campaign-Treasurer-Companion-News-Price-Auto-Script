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

        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Hello World');
};

http.createServer(handle).listen(8080);

var scriptOne = {};

for(var index in scriptFileOne) {
    var script = scriptFileOne[index];
    scriptOne[index].news = script[0];
    scriptOne[index].timeId = script[1];
    scriptOne[index].percentage = script[2];
    scriptOne[index].item = script[3];

    if(percentage.trim().endsWith('DOWN')) {
        percentage = - parseFloat(percentage);
    }
    else {
        percentage = parseFloat(percentage);
    }


}

var scriptTwo = {};

for(var index in scriptFileTwo) {
    var script = scriptFileOne[index];
    scriptTwo[index].news = script[0];
    scriptTwo[index].timeId = script[1];
    scriptTwo[index].percentage = script[2];
    scriptTwo[index].item = script[3];

    if(percentage.trim().endsWith('DOWN')) {
        percentage = - parseFloat(percentage);
    }
    else {
        percentage = parseFloat(percentage);
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