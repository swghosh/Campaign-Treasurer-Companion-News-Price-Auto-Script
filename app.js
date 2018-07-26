#!/usr/bin/env node

const httpPort = process.env.PORT || 8080
const jsonLink = 'http://storage.googleapis.com/campaign-treasurer-companion.appspot.com/newsscripts17.json'

var http = require('http')
var url = require('url')
var fs = require('fs')

var scriptsList = {}

var downloadJson = (callback) => {
    http.get(jsonLink, (res) => {
        var data = ''
        res.on('data', (chunk) => {
            data += chunk
        })
        res.on('end', () => {
            var downloadedObject = JSON.parse(data)
            callback(downloadedObject)
        })
    })
}

var startWebServer = () => {

    var webServer = http.createServer((req, res) => {
        var parsedUrl = url.parse(req.url)
        var body = ''

        console.log(`[${new Date().toString()}] ${req.url} was requested`)

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
            'Content-Type': 'text/html; charset=utf8'
        })
        fs.createReadStream('static/index.html', 'utf8').pipe(res)
    }
    else if(pathname == '/base.css') {
        res.writeHead(200, {
            'Content-Type': 'text/css; charset=utf8'
        })
        fs.createReadStream('static/base.css', 'utf8').pipe(res)
    }
    else if(pathname == '/switch.css') {
        res.writeHead(200, {
            'Content-Type': 'text/css; charset=utf8'
        })
        fs.createReadStream('static/switch.css', 'utf8').pipe(res)
    }
    else if(pathname == '/switch.js') {
        res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf8'
        })
        fs.createReadStream('static/switch.js', 'utf8').pipe(res)
    }
    else if(pathname == '/script.json') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf8'
        })
        res.end(JSON.stringify(scriptsList))
    }
    else if(pathname == '/loading.gif') {
        res.writeHead(200, {
            'Content-Type': 'image/gif'
        })
        fs.createReadStream('static/loading.gif').pipe(res)
    }
    else if(pathname == '/authenticate') {
        res.writeHead(401, {
            'WWW-Authenticate': 'Basic realm="Access to staging site"',
            'Content-Type': 'text/html; charset=utf8'
        })
        res.end('<h1>Unathorised</h1>')
    }
    else {
        res.writeHead(404, {
            'Content-Type': 'text/html; charset=utf8'            
        })
        res.end('This is not the resource that you are looking for. It seems like a four zero four error occured.')
    }
}
