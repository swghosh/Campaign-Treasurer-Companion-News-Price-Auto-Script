#!/usr/bin/env node

const httpPort = process.env.PORT || 8080
const jsonLink = process.env.SCRIPTS_LIST_LINK
const accessUsername = process.env.ACCESS_USERNAME
const accessPassword = process.env.ACCESS_PASSWORD

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

var runner = require('./runner')
var authy = require('./basicauthy')

var scriptsList = {}
let controller = null

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
            authy.makeAuthy(accessUsername, accessPassword, 'This is a protected unit. Unathorised access is not allowed, please use valid credentials.', 'Protected unit', req, res, (req, res) => {
                produceResponse(parsedUrl.pathname, body, res)
            })
        })
    })

    downloadJson((downloadedObject) => {
        scriptsList = downloadedObject

        controller = new runner.ScriptsControl(scriptsList)

        webServer.listen(httpPort)
        console.log(`[${new Date().toString()}] Web Server started at port ${httpPort}`)
    })
}

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
        // pretty JSON for increased readability
        res.end(JSON.stringify(scriptsList, undefined, 4))
    }
    else if(pathname == '/startScript') {
        try {
            // instruction object (JSON as POST data)
            // 
            // {
            //     "start": true | false,
            //     "scriptName": "nameOfTheScript"
            // }
            
            var instruction = JSON.parse(body)
            
            controller.startScript((instruction.start) ? instruction.scriptName : undefined)

            var status = controller.status()
            status.started = instruction.scriptName

            res.writeHead(200, {
                'Content-Type': mimeTypes['.json'] + '; charset=utf8'
            })
            res.end(JSON.stringify(status))
        }
        catch(err) {
            var status = controller.status()
            status.notStarted = ''

            res.writeHead(200, {
                'Content-Type': mimeTypes['.json'] + '; charset=utf8'
            })
            res.end(JSON.stringify(status))
        }
    }
    else if(pathname == '/stopCurrentlyRunningScript') {
        controller.stopCurrentlyRunningScript()

        res.writeHead(200, {
            'Content-Type': mimeTypes['.json'] + '; charset=utf8'
        })
        res.end(JSON.stringify(controller.status()))
    }
    else if(pathname == '/status') {
        res.writeHead(200, {
            'Content-Type': mimeTypes['.json'] + '; charset=utf8'
        })
        res.end(JSON.stringify(controller.status()))
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

startWebServer()
