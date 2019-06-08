const log4js = global.log4js || (global.log4js = require("log4js"));
const logger = log4js.getLogger("HttpServer");
const sysPath = require("path");
const fs = require("fs");
const http = require("http");
const express = require("express");

const _sendContents = (req, res, publicPath, page, context, next) => {
    fs.readFile(sysPath.join(publicPath, `index.${ page }.html`), (err, contents) => {
        if (err) {
            next(err);
            return;
        }
        contents = contents.toString().replace(/\b(href|src|data-main)="(?!https?:\/\/|\/)([^"]+)/g, `$1="${ context }$2`);
        contents = contents.replace("baseUrl: ''", `baseUrl: '${ context }'`);
        res.send(contents);
    });
};

const sendContents = (req, res, publicPath, context, next) => {
    const url = req.path.substring(context.length);
    if (url === "") {
        _sendContents(req, res, publicPath, "classic", context, next);
    } else if (/^app(?:\/|$)/.test(url)) {
        _sendContents(req, res, publicPath, "single", context, next);
    } else if (/^web(?:\/|$)/.test(url)) {
        _sendContents(req, res, publicPath, "classic", context, next);
    } else {
        next();
    }
};

const logInterfaceInfo = (info, listenedIface) => {
    if (info.family === "IPv6") {
        logger.info(`http://[${ info.address }]:${ listenedIface.port }`);
    } else {
        logger.info(`http://${ info.address }:${ listenedIface.port }`);
    }
};

const logServerStatus = server => {
    const listenedIface = server.address();
    logger.info("Server listening on", listenedIface);
    const {address} = listenedIface;

    if (address !== "0.0.0.0" && address !== "::") {
        logInterfaceInfo(listenedIface, listenedIface);
        return;
    }

    const networkInterfaces = require("os").networkInterfaces();
    const ifaces = [];

    Object.keys(networkInterfaces).forEach(ifname => {
        const iface = networkInterfaces[ifname];

        for (let k = 0, len1 = iface.length; k < len1; k++) {
            const info = iface[k];

            if (address === "::" || info.family === listenedIface.family) {
                ifaces.push(info);
            }
        }
    });

    ifaces.sort(({family: a}, {family: b}) => {
        return a > b ? 1 : a < b ? -1 : 0;
    }).forEach(info => {
        logInterfaceInfo(info, listenedIface);
    });
};

exports.startServer = ({port, hostname: host, path: publicPath}, callback) => {
    publicPath = sysPath.resolve(__dirname, "..", publicPath);
    const app = express();

    const context = "/";

    // prefer using nginx or httpd for static files
    app.use(context.slice(0, context.length - 1), express["static"](publicPath));

    if (context !== "/") {
        app.get("/", (req, res, next) => {
            res.redirect(301, context);
        });
    }

    // prefer using nginx subs_filter https://www.nginx.com/resources/wiki/modules/substitutions/
    // or httpd Substitute https://httpd.apache.org/docs/2.4/mod/mod_substitute.html
    app.get(`${ context }*`, (req, res, next) => {
        sendContents(req, res, publicPath, context, next);
    });

    const server = http.createServer(app);

    server.listen(port, host, () => {
        logServerStatus(server);

        process.on("uncaughtException", ex => {
            logger.error(`Exception: ${ ex.stack }`);
        });

        if (typeof callback === "function") {
            callback();
        }
    });

    return server;
};
