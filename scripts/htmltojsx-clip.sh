#!/bin/sh

#Absolute path to this script
SCRIPT=$(readlink -f "$0")
#Absolute path this script is in
SCRIPTPATH=$(dirname "$SCRIPT")

res=$(cat /dev/clipboard | node "${SCRIPTPATH}/htmltojsx.js" --stdin "$@" | sed -e 's/^      //' -e '$!{s/  /    /g}'); echo "$res" > /dev/clipboard