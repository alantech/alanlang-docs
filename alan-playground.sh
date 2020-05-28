#!/bin/bash

rm -rf compiler
rm bundle.js
git clone git@github.com:alantech/alan.git
cd alan/compiler
yarn install
yarn bundle
cd ../..
mv alan/compiler/bundle.js bundle.js
rm -rf alan
