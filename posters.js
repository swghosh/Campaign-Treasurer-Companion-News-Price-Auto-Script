#!/bin/env node
// Node.js single file Module to allow making price and news updates to Campaign Treasurer Companion

// import the required modules
var http = require('http');
var querystring = require('querystring');

// constants to use with URL
const hostname = 'campaign-treasurer-companion.appspot.com';
const authorisationToken = process.env.CTCADMINTOKEN || 'someuser:somepassword';

// paths to use URL(s) in HTTP requests
const pathForNewsUpdate = '/masterpanel/addnews.php';
const pathForPriceOf = '/masterpanel/getprice.php';
const pathForPriceUpdate = '/masterpanel/updateprice.php';

var descriptor = {
    hostname: hostname,
    // path: somePath,
    // method: 'POST' || 'GET',
    auth: authorisationToken,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length' : 0
    }
}

exports.differenceNewsAndPriceUpdate = 60000

// function to chain update (postNews, wait for difference time, get priceOf, then updatePrice)
exports.chainUpdate = function(updateItem, callback) {
    exports.postNews(updateItem.news, () => {
        setTimeout(() => {
            exports.priceOf(updateItem.item, (price) => {
                var updatedPrice = parseFloat((price + (price * updateItem.percentage * 0.01)).toFixed(2))
                exports.updatePrice(updateItem.item, updatedPrice, () => {
                    callback()
                })
            })
        }, exports.differenceNewsAndPriceUpdate)
    })
}

// function to post news content and run a callback
exports.postNews = function(content, callback) {

    // post data contains the news content
    var postData = querystring.stringify({
        content: content
    });

    // descriptor to make a HTTP request
    var options = descriptor;
    options.path = pathForNewsUpdate
    options.method = 'POST'
    options.headers['Content-Length'] = postData.length

    // make the HTTP request to send news update
    var request = http.request(options, (response) => {
        var data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
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

    // descriptor to make a HTTP request
    var options = descriptor;
    options.path = pathForPriceOf + '?' + querystring.stringify({name: item})
    options.method = 'GET'
    options.headers = {}

    // make the HTTP request to get price of item
    var request = http.request(options, (response) => {
        var data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            // perform callback with price
            var price = parseFloat(data.split('\n')[1]);
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
    var options = descriptor;
    options.path = pathForPriceUpdate
    options.method = 'POST'
    options.headers['Content-Length'] = postData.length

    // make the HTTP request to send news update
    var request = http.request(options, (response) => {
        var data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            // perform callback
            callback(data);
        });
    });

    // write the post data to the request and end the request
    request.write(postData);
    request.end();
};