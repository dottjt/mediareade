#!/bin/sh

npm run start:prod

git add .
git commit -m 'new automated deploy release'
git push

npm version patch
npm publish --access public