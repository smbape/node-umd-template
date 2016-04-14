#!/bin/sh

exec 1>/dev/tty 2>/dev/tty

#Absolute path to this script
SCRIPT=$(readlink -f "$0")
#Absolute path this script is in
SCRIPTPATH=$(dirname "$SCRIPT")

cd "${SCRIPTPATH}/.."

node node_modules/umd-builder/node_modules/requirejs/bin/r.js -o work/rbuild.js
dst="public/javascripts/main-all.js"
cat vendor/require.js > "$dst"
echo $'\nwindow._nextTick = requirejs.s.contexts._.nextTick;\nrequirejs.s.contexts._.nextTick = function(fn){fn();};\n' >> "$dst"
cat public/javascripts/main-built.js >> "$dst"
echo 'requirejs.s.contexts._.nextTick = window._nextTick; delete window._nextTick' >> "$dst"
