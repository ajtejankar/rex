# Rex

Rex is a regular expression engine based on NFA simulation algorithm by
Ken Thompson. Specifically, it was inspired by an [article][1] by Russ Cox
regarding regular expression matching.

# Features

1. Supports character classes `[abc]` and `[^abc]`.
2. Supports unary operators like `a+`, `b?` and `c*`.
3. Supports alternation operator `a|b`.
4. Supports sub-expressions `(abc)+def`.
5. Supports character escaping `[ab\\[]`.

# Todo

- [ ] `.` operator
- [ ] `-` in classes
- [ ] `{n,m}` operator
- [ ] remember support

# API

Currently it only supports two api methods `test` and `match` which behave
like the `test` and `exec` methods in JS regular expressions. Please look up
the comments in code for more specific information.


[1]: https://swtch.com/~rsc/regexp/regexp1.html
