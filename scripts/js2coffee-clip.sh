#!/bin/sh
# 

#Absolute path to this script
SCRIPT=$(readlink -f "$0")
#Absolute path this script is in
SCRIPTPATH=$(dirname "$SCRIPT")

cd "$SCRIPTPATH"

res="$(cat /dev/clipboard | node ../node_modules/js2coffee/bin/js2coffee -i '    ')" && echo "$res" > /dev/clipboard
