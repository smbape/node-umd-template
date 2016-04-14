log4js = global.log4js or (global.log4js = require 'log4js')
logger = log4js.getLogger 'HttpServer'
sysPath = require 'path'
fs = require 'fs'

context = '/'

sendContents = (req, res, path, context, next)->
    url = req.path.substring(context.length)

    if url is ''
        _sendContents req, res, path, 'classic', context
    else if /^app\b/.test(url)
        _sendContents req, res, path, 'single', context
    else if /^web\b/.test url
        _sendContents req, res, path, 'classic', context
    else
        next()
    return

_sendContents = (req, res, path, page, context)->
    filePath = sysPath.join path, 'index.' + page + '.html'
    fs.readFile filePath, (err, contents)->
        contents = contents.toString().replace /\b(href|src|data-main)="(?!https?:\/\/|\/)([^"]+)/g, "$1=\"#{context}$2"
        contents = contents.replace "baseUrl: ''", "baseUrl: '#{context}'"
        res.send contents
        return
    return true

logServerStatus = (server) ->
    log = (info, listenedIface) ->
        if info.family is 'IPv6'
            logger.info 'http://[' + info.address + ']:' + listenedIface.port
        else
            logger.info 'http://' + info.address + ':' + listenedIface.port
        return

    listenedIface = server.address()
    logger.info 'Server listening on', listenedIface
    if (ref = listenedIface.address) == '0.0.0.0' or ref == '::'
        ifaces = require('os').networkInterfaces()
        for iface of ifaces
            for info in ifaces[iface]
                if info.family is 'IPv6' or info.family is listenedIface.family
                    log info, listenedIface
    else
        log listenedIface, listenedIface
    return

exports.startServer = (port, path, callback)->
    path = sysPath.resolve __dirname, '..', path

    express = require 'express'
    app = express()

    # prefer using nginx or httpd for static files
    app.use context.substring(0, context.length - 1), express.static path

    # prefer using nginx or httpd rewrite
    if context isnt '/'
        app.get '/', (req, res, next)->
            res.redirect 301, context
            return

    # prefer using nginx subs_filter https://www.nginx.com/resources/wiki/modules/substitutions/
    # or httpd Substitute https://httpd.apache.org/docs/2.4/mod/mod_substitute.html
    app.get context + '*', (req, res, next)->
        sendContents req, res, path, context, next
        return

    http = require 'http'
    server = http.createServer app

    server.listen port, ->
        logServerStatus server

        process.on 'uncaughtException', (ex)->
            logger.error "Exception: #{ex.stack}"
            return

        callback() if 'function' is typeof callback
        return

    server
