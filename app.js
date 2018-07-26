#!/usr/bin/env node

const httpPort = process.env.PORT || 8080
const jsonLink = 'http://storage.googleapis.com/campaign-treasurer-companion.appspot.com/newsscripts17.json'

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.gif': 'image/gif',
    '.png': 'image/png',
    'other': 'application/octet-stream'
}

var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')

var scriptsList = {}

var downloadJson = (callback) => {
    http.get(jsonLink, (res) => {
        var data = ''
        res.on('data', (chunk) => {
            data += chunk
        })
        res.on('end', () => {
            var downloadedObject = JSON.parse(data)

            console.log(`[${new Date().toString()}] Downloaded JSON file`)

            callback(downloadedObject)
        })
    })
}

var startWebServer = () => {

    var webServer = http.createServer((req, res) => {
        var parsedUrl = url.parse(path.normalize(req.url))
        var body = ''

        console.log(`[${new Date().toString()}] ${req.method} ${req.url}`)

        req.on('data', (chunk) => {
            if(body.length > 1e6) req.connection.destroy()
            body += chunk
        })
        req.on('end', () => {
            produceResponse(parsedUrl.pathname, body, res)
        })
    })

    downloadJson((downloadedObject) => {
        scriptsList = downloadedObject

        webServer.listen(httpPort)
        console.log(`[${new Date().toString()}] Web Server started at port ${httpPort}`)
    })
}

startWebServer()

var produceResponse = (pathname, body, res) => {
    if(pathname == '/') {
        res.writeHead(200, {
            'Content-Type': mimeTypes['.html']
        })
        fs.createReadStream(path.join('static', 'index.html'), 'utf8').pipe(res)
    }
    else if(pathname == '/script.json') {
        res.writeHead(200, {
            'Content-Type': mimeTypes['.json'] + '; charset=utf8'
        })
        res.end(JSON.stringify(scriptsList))
    }
    else {
        var fileStream = fs.createReadStream(path.join('static', pathname)).on('error', (err) => {
            fourZeroFour(res)
        })
        
        var extension = pathname.substring(pathname.lastIndexOf('.')) || 'other'

        res.writeHead(200, {
            'Content-Type': (mimeTypes[extension] == undefined) ? mimeTypes['other'] : mimeTypes[extension]
        })
        fileStream.pipe(res)
    }
}

var fourZeroFour = (res) => {
    res.writeHead(404, {
        'Content-Type': 'text/html; charset=utf8'            
    })
    res.end('This is not the resource that you are looking for. It seems like a four zero four error occured.')
}
