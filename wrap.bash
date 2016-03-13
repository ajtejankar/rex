#!/usr/bin/env bash

shopt -s extglob
shopt -s globstar
shopt -s nullglob

echo '
(function() {
"use strict";
'
# cat src/*.js | sed 's/export default//' | sed '/let queue = this.queue/ a debugger';
cat src/!(index).js src/index.js | sed 's/export default//' | sed '/^import/ d';
sed -n <test/index.js '14,20 p' | { echo 'debugger;'; sed 's/assert\.equal//'; }

echo '
})();'
