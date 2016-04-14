#!/bin/sh
# 

res="$(cat /dev/clipboard | js2coffee -i '    ')" && echo "$res" > /dev/clipboard
