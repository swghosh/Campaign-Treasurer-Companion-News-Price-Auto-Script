#!/bin/env node
// Node.js Application to publish automatic time based news and price updates to Campain Treasurer Companion

// import required modules
var http = require('http');
var fs = require('fs');

var posters = require('./posters.js');

// boolean switch to allow script control
var scriptOneSwitch = false;
var scriptTwoSwitch = false;

// set the duration between a news update and a price update
const durationNewsAndPrice = 60000;

// read json files with news, price update content as a JSON object
var scriptFileOne = JSON.parse(fs.readFileSync('./file1.json', 'utf8'));
var scriptFileTwo = JSON.parse(fs.readFileSync('./file2.json', 'utf8'));

// function to handle requests, process tasks and generate appropriate responses
var handle = function(request, response) {
    console.log(request.url, "was requested");

    // request to start auto update script part 1
    if(request.url == '/start1') {
        // set first switch to true
        scriptOneSwitch = true;
        // start from 0 index
        var index = 0;
        // run a loop to post all auto updates segregated by time id (time id is in minutes)
        for(var i in scriptOne) {
           // set timeout based on time id in minutes
           setTimeout(() => {
               if(scriptOneSwitch) {
                // run updater to post update
                updater(scriptOne[index].news, scriptOne[index].percentage, scriptOne[index++].item);
                // set first switch to false on end
                if(index == scriptOne.length) {
                    scriptOneSwitch = false;
                }
               }
           }, scriptOne[i].timeId * 60 * 1000);
        }
        // send appropriate success response as text
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Script 1 started');
    }

    // request to start auto update script part 2 
    else if(request.url == '/start2') {
        // set second switch to true
        scriptTwoSwitch = true;
        // start from 0 index
        var index = 0;
        // run a loop to post all auto updates segregated by time id (time id is in minutes)
        for(var i in scriptTwo) {
           // set timeout based on time id in minutes
           setTimeout(() => {
                if(scriptTwoSwitch) {
                    // run updater to post update
                    updater(scriptTwo[index].news, scriptTwo[index].percentage, scriptTwo[index++].item);
                    // set second switch to false on end
                    if(index == scriptTwo.length) {
                        scriptTwoSwitch = false;
                    }
                }
           }, scriptTwo[i].timeId * 60 * 1000);
        }
        // send appropriate success response as text
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Script 2 started');
    }

    // request to stop auto update script part 1
    else if(request.url == '/stop') {
        // set both switches to false
        scriptOneSwitch = scriptTwoSwitch = false;
        // send appropriate success response as text
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('All scripts are off now!');
    }

    // request to stop auto update script part 2
    else {
        // send appropriate response with status as text
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Host is up and doing!\n' + 'script one running: ' + scriptOneSwitch + '\nscript two running: ' + scriptTwoSwitch);
    }

};

// specify port where web server is to be runt
const port = process.env.PORT || 3000;

// create the web server and make it listen to port 8080
var server = http.createServer(handle).listen(port);

// initialise empty arrays for holding objects of auto update scripts
var scriptOne = [];
var scriptTwo = [];

// process array of objects for auto update script part 1
for(var index in scriptFileOne) {
    var script = scriptFileOne[index];
    // make objects with news, time id, percentage, item
    scriptOne[index] = {};
    scriptOne[index].news = script[0];
    scriptOne[index].timeId = script[1];
    scriptOne[index].percentage = script[2];
    scriptOne[index].item = script[3];

    // use negative for percentage strings with DOWN
    if(scriptOne[index].percentage.trim().endsWith('DOWN')) {
        scriptOne[index].percentage = - parseFloat(scriptOne[index].percentage);
    }
    // otherwise use positive percentage
    else {
        scriptOne[index].percentage = parseFloat(scriptOne[index].percentage);
    }
}

// process array of objects for auto update script part 2
for(var index in scriptFileTwo) {
    var script = scriptFileTwo[index];
    // make objects with news, time id, percentage, item
    scriptTwo[index] = {};
    scriptTwo[index].news = script[0];
    scriptTwo[index].timeId = script[1];
    scriptTwo[index].percentage = script[2];
    scriptTwo[index].item = script[3];

    // use negative for percentage strings with DOWN
    if(scriptTwo[index].percentage.trim().endsWith('DOWN')) {
        scriptTwo[index].percentage = - parseFloat(scriptTwo[index].percentage);
    }
    // otherwise use positive percentage
    else {
        percentage = parseFloat(scriptTwo[index].percentage);
    }
}

// function that'll process a news update and price update with an interval
var updater = function(news, percentage, item) {
    // post the news update with the content
    posters.postNews(news, (output) => { });
    // perform price update after a certain constant duration
    setTimeout(() => {
        // check the price of the current item name and callback 
        posters.priceOf(item, (value) => {
            // calculate the difference in price and new price
            var difference = (value * percentage) / 100;
            var newPrice = value + difference;
            // post the price update with item name and new value
            posters.updatePrice(item, newPrice, (output) => { });
        });
    }, durationNewsAndPrice);
};