#!/usr/bin/env bash

echo '
(function() {
"use strict";
'
# cat src/*.js | sed 's/export default//' | sed '/let queue = this.queue/ a debugger';
cat src/*.js | sed 's/export default//' | sed '13 a debugger;';
sed -n <test/engine.js '5,23 p'
sed -n <test/engine.js '55,61 p' | sed 's/assert\.equal//'

echo '
})();'
