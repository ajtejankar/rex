# Rex

Rex is a regular expression engine based on NFA simulation algorithm by
Ken Thompson. Specifically, it was inspired by an [article][1] by Russ Cox
regarding regular expression matching.

# API

Currently it only supports two api methods `test` and `match` which behave
like the `test` and `exec` methods in JS regular expressions.


[1]: https://swtch.com/~rsc/regexp/regexp1.html
