#!/bin/bash

rm -rf compiler
rm bundle.js
git clone git@github.com:alantech/compiler.git
cd compiler
git submodule init && git submodule update
yarn install
yarn bundle
cd ..
mv compiler/bundle.js bundle.js
rm -rf compiler