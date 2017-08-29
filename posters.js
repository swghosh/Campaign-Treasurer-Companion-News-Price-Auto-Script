var http = require('http');
var url = require('url');
var querystring = require('querystring');

exports.postNews = function(content, callback) {

    var postData = querystring.stringify({
        content: content
    });

    var options = { 
        href: 'http://ctcadmin:christuniversity2017prayasctc@campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com/masterpanel/addnews.php',
        origin: 'http://campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com',
        protocol: 'http:',
        host: 'campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com',
        hostname: 'campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com',
        port: '',
        path: '/masterpanel/addnews.php',
        method: 'POST',
        headers: {
            'Authorization': 'Basic Y3RjYWRtaW46Y2hyaXN0dW5pdmVyc2l0eTIwMTdwcmF5YXNjdGM=',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length' : postData.length
        }
    };

    var request = http.request(options, (response) => {
        var data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            console.log(data);

            callback(data);
        });
    });

    request.write(postData);
    request.end();
};

exports.priceOf = function(item, callback) {

    var request = http.get('http://ctcadmin:christuniversity2017prayasctc@campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com/masterpanel/getprice.php?name=' + item, (response) => {
        var data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            console.log(data);

            var price = parseFloat(data.split("\n")[1]);
            callback(price);
        });
    });
    
    request.end();
};

exports.updatePrice = function(item, price, callback) {
    
        var postData = querystring.stringify({
            item: item,
            current: price
        });
    
        var options = { 
            href: 'http://ctcadmin:christuniversity2017prayasctc@campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com/masterpanel/updateprice.php',
            origin: 'http://campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com',
            protocol: 'http:',
            host: 'campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com',
            hostname: 'campaigntreasurercompanionwebapp.ap-south-1.elasticbeanstalk.com',
            port: '',
            path: '/masterpanel/updateprice.php',
            method: 'POST',
            headers: {
                'Authorization': 'Basic Y3RjYWRtaW46Y2hyaXN0dW5pdmVyc2l0eTIwMTdwcmF5YXNjdGM=',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length' : postData.length
            }
        };
    
        var request = http.request(options, (response) => {
            var data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                console.log(data);
    
                callback(data);
            });
        });
    
        request.write(postData);
        request.end();
};