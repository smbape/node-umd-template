const net = require("net");
const {basename, extname} = require("path");
const merge = require("lodash/merge");
const anymatch = require("anymatch");
const {matcher, config} = require("umd-builder/lib/brunch-config");
const TersrOptimizer = require("terser-brunch");
const AutoReloader = require("auto-reload-brunch");
const eachOfLimit = require("async/eachOfLimit");
const https = require("https");
const {Server: WebSocketServer} = require("ws");

const os = require("os");
const platform = os.platform();
const cpus = os.cpus().length;

const shuffle = a => {
    for (let i = a.length, j; i; i--) {
        j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
    return a;
};

const findFreePort = (start, end, host, cb) => {
    let ports = Array.isArray(start) ? start.slice().reverse() : null;

    if (!ports && start == null) {
        start = 1024;
    }

    if (start != null && end == null) {
        end = 65534 + 1;
    }

    if (start != null && end != null) {
        if (start > end) {
            throw new RangeError(`AutoReloader: start ${ start } port is higher than end port ${ end }`);
        }

        const len = end - start + 1;
        ports = new Array(len);
        for (let i = 0; i < len; i++) {
            ports[i] = start + i;
        }
        shuffle(ports);
    }

    if (typeof cb !== "function") {
        throw new Error("AutoReloader: callback is not a function");
    }

    let res;
    const iterable = {};

    iterable[Symbol.iterator] = function() {
        return {
            next: () => {
                const done = res != null ? true : ports.length === 0;
                const port = done ? null : ports.pop();

                return {
                    value: port,
                    done
                };
            }
        };
    };

    const networkInterfaces = os.networkInterfaces();
    const ifaces = [];

    // eslint-disable-next-line guard-for-in
    for (const ifname in networkInterfaces) {
        const iface = networkInterfaces[ifname];
        const ifaceLen = iface.length;

        for (let i = 0; i < ifaceLen; i++) {
            ifaces.push(iface[i]);
        }
    }

    ifaces.filter(({family, address}) => {
        if (typeof host === "string") {
            if (host === "::") {
                return true;
            }

            const hfamily = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ? "IPv4" : "IPv6";
            return family === hfamily && (host === address || host === "0.0.0.0");
        }

        return false;
    });

    if (ifaces.length === 0) {
        cb(new Error(`Invalid host ${ host }`));
        return;
    }

    eachOfLimit(iterable, 1, (port, key, next) => {
        eachOfLimit(ifaces, ifaces.length, ({address}, i, next) => {
            if (res != null) {
                next();
                return;
            }

            const s = net.createConnection({
                port,
                host: address
            });

            s.on("connect", () => {
                s.end();
                next(new Error(`AutoReloader: port ${ port } is not available on ${ address }`));
            });

            s.on("error", err => {
                next();
            });
        }, err => {
            if (!err && res == null) {
                res = port;
            }
            next();
        });
    }, () => {
        cb(res == null ? new Error("AutoReloader: Not able to find an available port") : null, res);
    });
};

AutoReloader.prototype.startServer = function() {
    const conns = this.connections;
    const host = this.config.host || exports.config.server.hostname || "0.0.0.0";
    const ports = this.config.port == null ? null : this.port ? [this.port].concat(this.ports) : this.ports;

    findFreePort(ports, null, host, (err, port) => {
        if (err) {
            throw err;
        }

        this.port = port;

        // console.error(`auto-reload listening on ${ host }:${ port }`);

        if (this.ssl) {
            this.httpsServer = https.createServer({
                key: this.key,
                cert: this.cert
            });
            this.httpsServer.listen(port, host);
            this.server = new WebSocketServer({
                server: this.httpsServer
            });
        } else {
            this.server = new WebSocketServer({
                host,
                port
            });
        }

        this.server.on("connection", conn => {
            conns.push(conn);
            conn.on("close", () => conns.splice(conns.indexOf(conn), 1));
        });
    });
};

const babelLintIgnore = anymatch([
    config.conventions.vendor,
    matcher(["bower_components/umd-core/lib/**"])
]);

config.compilers.unshift(require("umd-builder/lib/compilers/babel"));
config.compilers.push(...[
    require("umd-builder/lib/compilers/html"),
    require("umd-builder/lib/compilers/stylus")
]);

const npmModules = ["node_modules/auto-reload-brunch/vendor"];

const appModules = ["app/node_modules", "bower_components"].concat(npmModules);

const javascriptsJoinTo = new RegExp(matcher(["app/node_modules"].concat(npmModules)).source + /[/\\]/.source);

const isVendor = anymatch([
    new RegExp(matcher(npmModules).source + /[/\\]/.source),
    config.conventions.vendor
]);

const es6rules = {
    "arrow-parens": 0,
    "arrow-spacing": 0,
    "no-class-assign": 0,
    "no-confusing-arrow": 0,
    "no-const-assign": 0,
    "no-dupe-class-members": 0,
    "no-duplicate-imports": 0,
    "no-new-symbol": 0,
    "no-useless-computed-key": 0,
    "no-useless-constructor": 0,
    "no-useless-rename": 0,
    "no-var": 0,
    "object-shorthand": 0,
    "prefer-arrow-callback": 0,
    "prefer-const": 0,
    "prefer-numeric-literals": 0,
    "prefer-spread": 0,
    "prefer-template": 0,
    "require-yield": 0,
    "rest-spread-spacing": 0,
    "sort-imports": 0,
    "symbol-description": 0,
    "template-curly-spacing": 0,
    "yield-star-spacing": 0
};

// https://github.com/brunch/brunch/blob/2.8.2/docs/config.md
exports.config = merge(config, {

    // http://requirejs.org/docs/api.html#config-map
    requirejs: {
        waitSeconds: 30, // prevent slow networks from breaking the application
        map: {
            "*": {
                underscore: "lodash"
            }
        },

        deps: [
            "auto-reload-brunch/vendor/auto-reload"
        ]
    },

    modules: {
        pathCleaner: new RegExp(matcher(appModules).source + /[/\\](.*)$/.source)
    },

    paths: {
        watched: ["app"].concat(npmModules)
    },

    files: {
        javascripts: {
            joinTo: {
                "javascripts/app.js": javascriptsJoinTo
            }
        }
    },

    conventions: {
        vendor: isVendor
    },

    plugins: {
        babel: {
            workers: cpus >> 1,
            ignore: babelLintIgnore
        },

        amd: {
            eslint: true,
            optimizer: TersrOptimizer
        },

        eslint: {
            workers: cpus >> 1,
            config: {
                fix: true,
                ignore: false, // let brunch deal with ignore
                globals: [
                    "define:false"
                ]
            },

            ignore: babelLintIgnore,

            overrides: {
                "*": ({data, path, map}) => {
                    const re = /babelHelpers\.classCallCheck\(this, (\w+)\)/g;
                    const names = {};

                    let match;
                    while (match = re.exec(data)) {
                        names[match[1]] = 1;
                    }

                    return {
                        rules: Object.assign({
                            "no-invalid-this": 0,
                            "no-unused-expressions": 0,
                            "no-shadow": [2, {
                                allow: [
                                    "require",
                                    "promise",
                                    "done",
                                    "err",
                                    "next",
                                    "error",
                                    "success",
                                    "complete"
                                ].concat(Object.keys(names))
                            }]
                        }, es6rules)
                    };
                },

                "*.coffee": ({data, path, map}) => {
                    const re = /^[^\S\r\n]*(\w+) = function \1\(|babelHelpers\.classCallCheck\(this, (\w+)\)/mg;
                    const names = {};
                    let match;
                    while (match = re.exec(data)) {
                        names[match[1] || match[2]] = 1;
                    }

                    return {
                        rules: {
                            "no-redeclare": 0,
                            "no-use-before-define": 0,
                            "no-invalid-this": 0,
                            "no-void": 0,
                            "no-useless-escape": 0,
                            "no-sequences": 0,
                            "no-shadow": [2, {
                                allow: [
                                    "require",
                                    "promise",
                                    "done",
                                    "err",
                                    "next",
                                    "error",
                                    "success",
                                    "complete"
                                ].concat(Object.keys(names))
                            }],
                            "no-return-assign": 0,
                            "no-empty-function": 0,
                            "guard-for-in": 0,
                            "consistent-return": 0
                        }
                    };
                }
            }
        },

        html: {
            type: "common"
        },

        autoReload: {
            enabled: {
                css: true,
                js: true,
                assets: true
            },

            port: process.env.AUTORELOAD_PORT,
            delay: platform === "win32" ? 200 : undefined
        }
    },

    server: {
        path: "./server/HttpServer",
        hostname: "127.0.0.1",
        port: process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT, 10) : 3330
    },

    overrides: {
        production: {
            requirejs: {
                deps: []
            },
            plugins: {
                autoReload: {
                    enabled: false
                }
            },
            paths: {
                watched: ["app"]
            }
        }
    }
});
