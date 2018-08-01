exports.makeAuthy = (username, password, messageFallback, realm, originalRequest, response, requestHandler) => {
    var authorisationString = Buffer.from(`${username}:${password}`).toString('base64')
    if(originalRequest.headers['authorization'] && originalRequest.headers['authorization'] === `Basic ${authorisationString}`) {
        requestHandler(originalRequest, response)
    }
    else {
        response.writeHead(401, {
            'WWW-Authenticate': `Basic realm=${realm}`,
            'Content-Type': 'text/plain'
        })
        response.end(messageFallback)
    }
}