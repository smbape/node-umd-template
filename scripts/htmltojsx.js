#!/usr/bin/env node

'use strict';

var fs = require('fs');
var HTMLtoJSX = require('htmltojsx');
var yargs = require('yargs');

main();

function main() {
    var argv = getArgs();
    if (argv.stdin) {
        var stdin = [];
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', stdin.push.bind(stdin));
        process.stdin.on('end', function() {
            processHtml(stdin.join(''), argv);
        });
    } else {
        var files = argv._;
        if (!files || files.length !== 1) {
            console.error('Please provide a file name');
            args.showHelp();
            process.exit(1);
        }

        fs.readFile(files[0], 'utf-8', function(err, input) {
            if (err) {
                console.error(err.stack);
                process.exit(2);
            }
            processHtml(input, argv);
        });
    }
}

function getArgs() {
    var args = yargs
        .usage(
            'Converts HTML to JSX for use with React.\n' +
            'Usage: $0 [-c ComponentName] file.htm'
        )
        .describe('className', 'Create a React component (wraps JSX in React.createClass call)')
        .alias('className', 'c')
        .describe('stdin', 'Read from stdin')
        .help('help')
        .example(
            '$0 -c AwesomeComponent awesome.htm',
            'Creates React component "AwesomeComponent" based on awesome.htm'
        )
        .strict();

    return args.argv;
}

function processHtml(input, options) {
    var converter = new HTMLtoJSX({
        createClass: !!options.className,
        outputClassName: options.className
    });
    var output = converter.convert(input);
    console.log(output);
}