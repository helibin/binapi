#!/bin/bash

echo -n 'API 接口数量：            '
echo `cat src/router/*Router.js | grep 'router\.' | wc -l` total

echo -n '后端 js   代码行数：'
wc -l `find ./src/ \
        -name '*.js' -print` | tail -n 1

echo -n '后端 Yaml 代码行数：'
wc -l src/const.yaml src/privilege.yaml | tail -n 1
