#!/bin/env node
// Node.js single file Module to allow making price and news updates to Campaign Treasurer Companion

// import the required modules
var http = require('http');
var url = require('url');
var querystring = require('querystring');

// constants to use with URL
const hostname = 'campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com';
const usernamePassword = 'ctcadmin:christuniversity2017prayasctc';

// paths to use URL(s) in HTTP requests
const pathForNewsUpdate = '/masterpanel/addnews.php';
const pathForPriceOf = '/masterpanel/getprice.php';
const pathForPriceUpdate = '/masterpanel/updateprice.php';

// function to post news content and run a callback
exports.postNews = function(content, callback) {

    // post data contains the news content
    var postData = querystring.stringify({
        content: content
    });

    // descriptor to make a HTTP request
    var options = { 
        href: 'http://' + usernamePassword + '@' + hostname + pathForNewsUpdate,
        origin: 'http://' + hostname,
        protocol: 'http:',
        host: hostname,
        hostname: hostname,
        port: '',
        path: pathForNewsUpdate,
        method: 'POST',
        headers: {
            'Authorization': 'Basic Y3RjYWRtaW46Y2hyaXN0dW5pdmVyc2l0eTIwMTdwcmF5YXNjdGM=',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length' : postData.length
        }
    };

    // make the HTTP request to send news update
    var request = http.request(options, (response) => {
        var data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            console.log(data);
            // perform callback
            callback(data);
        });
    });

    // write the post data to the request and end the request
    request.write(postData);
    request.end();
};

// function to find price of an item and run a callback with it
exports.priceOf = function(item, callback) {

    // make the HTTP request to get price of item
    var request = http.get('http://' + usernamePassword + '@' + hostname + pathForPriceOf + '?name=' + item, (response) => {
        var data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            console.log(data);
            // perform callback with price
            var price = parseFloat(data.split("\n")[1]);
            callback(price);
        });
    });
    
    // end the request
    request.end();
};

// function to post price update and run a callback
exports.updatePrice = function(item, price, callback) {
    
    // post data contains the item name and new price
    var postData = querystring.stringify({
        item: item,
        current: price
    });

    // descriptor to make a HTTP request
    var options = { 
        href: 'http://' + usernamePassword + '@' + hostname + pathForPriceUpdate,
        origin: 'http://' + hostname,
        protocol: 'http:',
        host: hostname,
        hostname: hostname,
        port: '',
        path: pathForPriceUpdate,
        method: 'POST',
        headers: {
            'Authorization': 'Basic Y3RjYWRtaW46Y2hyaXN0dW5pdmVyc2l0eTIwMTdwcmF5YXNjdGM=',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length' : postData.length
        }
    };

    // make the HTTP request to send news update
    var request = http.request(options, (response) => {
        var data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            console.log(data);
            // perform callback
            callback(data);
        });
    });

    // write the post data to the request and end the request
    request.write(postData);
    request.end();
};