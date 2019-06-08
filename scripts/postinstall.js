const fs = require("fs");
const which = require("which");
const sysPath = require("path");
const anyspawn = require("anyspawn");
const request = require("request");
const mkdirp = require("mkdirp");
const deepExtend = require("deep-extend");
const stripJsonComments = require("strip-json-comments");
const argv = process.argv.slice(2);
const push = Array.prototype.push;
const Module = module.constructor;

const chainedRequireResolve = (module, ...args) => {
    args.reverse();

    let parent = module;
    let filename;

    while (args.length !== 0) {
        filename = Module._resolveFilename(args.pop(), parent, false);

        parent = new Module(filename, module);
        parent.filename = filename;
        parent.paths = Module._nodeModulePaths(sysPath.dirname(filename));
    }

    return filename;
};

const postinstall = () => {
    // make sure patch executable exists
    which.sync("patch");

    const tasks = [
        next => {
            anyspawn.exec("patch", ["-p1", "-N", "-i", sysPath.resolve(__dirname, "../patches/selenium-webdriver-3.6.x-kill-tree.patch")], {
                cwd: sysPath.dirname(chainedRequireResolve(module, "protractor", "selenium-webdriver/package.json"))
            }, next);
        },

        "npm run update-webdriver",

        next => {
            mkdirp(sysPath.resolve(__dirname, "../app/assets/vendor/babel"), next);
        },

        next => {
            const {plugins} = JSON.parse(stripJsonComments(fs.readFileSync(sysPath.resolve(__dirname, "../.babelrc")).toString()));
            let whitelist;
            plugins.some(plugin => {
                if (Array.isArray(plugin) && (
                    plugin[0] === "@babel/plugin-external-helpers" || plugin[0] === "plugin-external-helpers" || plugin[0] === "external-helpers"
                )) {
                    whitelist = plugin[1].whitelist;
                    return true;
                }
                return false;
            });

            const args = [sysPath.resolve(__dirname, "../node_modules/@babel/cli/bin/babel-external-helpers.js"), "-t", "umd"];

            if (Array.isArray(whitelist) && whitelist.length !== 0) {
                args.push("-l", whitelist.join(","));
            }

            const child = anyspawn.spawn("node", args, {
                stdio: "pipe",
                cwd: sysPath.resolve(__dirname, "..")
            });

            child.stdout.pipe(fs.createWriteStream(sysPath.resolve(__dirname, "../app/assets/vendor/babel/external-helpers.js")));
            child.on("exit", code => {
                next();
            });
        }
    ];

    if (argv.indexOf("--preact") === -1) {
        tasks.push("bower install");
    } else {
        tasks.push(...[
            updateBowerJSON({
                dependencies: {
                    preact: undefined,
                    "preact-compat": undefined,
                    proptypes: undefined,
                }
            }),
            "bower install",
            installBowerFile({
                name: "preact",
                main: "preact.js",
                version: "8.1.0",
                cdn: "https://unpkg.com/preact@8.1.0",
                dependencies: {}
            }, sysPath.resolve(__dirname, "../patches/preact_8.1.0.patch")),
            installBowerFile({
                name: "proptypes",
                main: "proptypes.js",
                version: "1.1.0",
                cdn: "https://unpkg.com/proptypes@1.1.0",
                dependencies: {}
            }, sysPath.resolve(__dirname, "../patches/proptypes_1.1.0.patch")),
            installBowerFile({
                name: "preact-compat",
                main: "preact-compat.js",
                version: "3.16.0",
                cdn: "https://unpkg.com/preact-compat@3.16.0",
                dependencies: {
                    preact: "*",
                    proptypes: "*"
                }
            }, sysPath.resolve(__dirname, "../patches/preact-compat_3.16.0.patch")),
            updateBowerJSON({
                dependencies: {
                    preact: "^8.1.0",
                    "preact-compat": "^3.16.0",
                    proptypes: "^1.1.0",
                }
            })
        ]);
    }

    anyspawn.spawnSeries(tasks, {
        prompt: true,
        stdio: "inherit"
    }, err => {
        if (err) {
            throw err;
        }
    });
};

postinstall();

function installBowerFile(config, patch) {
    const compenent = config.name,
        url = config.cdn,
        dest = sysPath.resolve(__dirname, "..", "bower_components", compenent),
        file = sysPath.join(dest, config.main);

    const bowerFile = JSON.stringify(config, null, 2);

    return function() {
        const next = arguments[arguments.length - 1];
        mkdirp(dest, err => {
            if (err) {
                next(err);
                return;
            }

            const writer = fs.createWriteStream(file);
            writer.on("error", next);
            writer.on("finish", () => {
                if (!patch) {
                    fs.writeFile(sysPath.join(dest, "bower.json"), bowerFile, next);
                    return;
                }
                anyspawn.exec("patch", ["-N", "-i", patch, file], err => {
                    if (err) {
                        next(err);
                        return;
                    }
                    fs.writeFile(sysPath.join(dest, "bower.json"), bowerFile, next);
                });
            });
            request(url).pipe(writer);
        });
    };
}

function updateBowerJSON(config) {
    return () => {
        const next = arguments[arguments.length - 1];
        const bowerFile = sysPath.resolve(__dirname, "..", "bower.json");
        fs.readFile(bowerFile, (err, data) => {
            if (err) {
                next(err);
                return;
            }

            config = deepExtend(JSON.parse(data.toString()), config);
            orderProperty(config, "dependencies");
            orderProperty(config, "overrides");

            fs.writeFile(bowerFile, JSON.stringify(config, null, 2), next);
        });
    };
}

function orderProperty(obj, prop) {
    const current = obj[prop];
    const updated = {};
    Object.keys(current).sort().forEach(dep => {
        updated[dep] = current[dep];
    });
    obj[prop] = updated;
}
