let classes;

class Matcher {
  constructor() {
    this.state = 0;
    this.matched = '';
    this.matchStart = null;
    this.matchEnd = null;
  }

  reset() {
    this.state = 0;
    this.matched = '';
    this.matchStart = null;
    this.matchEnd = null;
  }
}

export default class Engine extends Matcher {
  constructor(ast) {
    super();

    if (!ast.length) ast.push({operator: 'char', operand: ''});

    this.used = [];
    this.matchers = ast.map(node => {
      if (node.operator && node.operand) {
        return new classes[node.operator](node.operand);
      }

      return new Engine(node, true);
    });
  }

  match(input) {
    if (this.state === 1 || this.state === -1) return this.state;

    let prevState, inputConsumed, foundExtra, i, matcher;

    for (i = 0; i < this.matchers.length; i++) {
      matcher = this.matchers[i];

      if (matcher.state === 1) continue;

      prevState = matcher.state;
      inputConsumed = !matcher.extra;
      matcher.match(input);
      foundExtra = matcher.extra;

      if ((matcher.state === -1 || (matcher.state === 1 && matcher.reset)) &&
          (foundExtra && prevState !== 0)) {

        matcher.reset();
        i--;
        continue;
      }

      if (inputConsumed) break;
    }

    for (i = 0; i < this.matchers.length; i++) {
      matcher = this.matchers[i];

      if (matcher.state === 0) break;

      if (this.state === 0) {
        this.state = 2;
        this.matchStart = input.index;
      }

      if (matcher.state === -1) {
        this.state = -1;
        this.matched = null;
        this.matchEnd = input.index;
        break;
      }

      if (matcher.state === 1 && !this.used[i]) {
        this.matched += matcher.matched;
        this.matchEnd = input.char ? input.index : input.index - 1;
        this.used[i] = true;
      }
    }

    if (i === this.matchers.length && this.matchers[i - 1].state === 1) {
      this.state = 1;
    }

    return this.state;
  }

  reset() {
    super.reset();
    this.used = [];
    this.matchers.forEach(matcher => matcher.reset());
  }
}

class Primitive extends Matcher {
  constructor(operand) {
    super();
    this.operand = operand;
  }

  match(input) {
    if (this._match(input.char)) {
      this.matched = input.char || '';
      this.state = 1;
    } else {
      this.state = -1;
    }

    this.matchStart = input.index;
    this.matchEnd = input.index;

    return this.state;
  }
}

class Char extends Primitive {
  _match(char) {
    return (char === this.operand);
  }
}

class Klass extends Primitive {
  _match(char) {
    return (this.operand.indexOf(char) !== -1);
  }
}

class IKlass extends Primitive {
  _match(char) {
    return (this.operand.indexOf(char) === -1);
  }
}

class Unary extends Matcher {
  constructor(operand) {
    super();
    this.extra = false;
    this.reset = false;
    this.operand = operand;
  }

  reset() {
    super.reset();
    this.extra = false;
    this.reset = false;
    this.operand.reset();
  }
}

class ZeroOrMore extends Unary {
  constructor(operand) {
    super(operand);
    this.extra = true;
  }

  match(input) {
    if (this.operand.state === 0 || this.operand.state === 2) {
      this.operand.match(input);
    }

    if (this.state === 0) {
      this.state = 2;
      this.matchStart = input.index;
    }

    if (this.operand.state === -1) {
      this.reset = true;
      this.state = 1;
    }

    else if (this.operand.state === 1) {
      this.matched += this.operand.matched;
      this.matchEnd = input.char ? input.index : input.index - 1;
      this.operand.reset();
    }

    return this.state;
  }

  reset() {
    super.reset();
    this.extra = true;
  }
}

class ZeroOrOne extends Unary {
  constructor(operand) {
    super(operand);
    this.extra = true;
  }

  match(input) {
    if (this.operand.state === 0 || this.operand.state === 2) {
      this.operand.match(input);
    }

    if (this.state === 0) {
      this.state = 2;
      this.matchStart = input.index;
    }

    if (this.operand.state === -1) {
      this.reset = true;
      this.state = 1;
    }

    else if (this.operand.state === 1) {
      this.reset = false;
      this.state = 1;
      this.matchEnd = input.char ? input.index : input.index - 1;
      this.matched += this.operand.matched;
    }

    return this.state;
  }

  reset() {
    super.reset();
    this.extra = true;
  }
}

class OneOrMore extends Unary {
  match(input) {
    if (this.operand.state === 0 || this.operand.state === 2) {
      this.operand.match(input);
    }

    if (this.state === 0) {
      this.state = 2;
      this.matchStart = input.index;
    }

    if (this.operand.state === -1) {
      if (this.state === 2 && this.extra) {
        this.state = 1;
        this.matchEnd = input.char ? input.index : input.index - 1;
      }
      else {
        this.state = -1;
      }
    }

    else if (this.operand.state === 1 && this.state === 2 && !this.extra) {
      this.extra = true;
      this.state = 1;
      this.matchEnd = input.char ? input.index : input.index - 1;
      this.matched += this.operand.matched;
    }

    return this.state;
  }
}


classes = {
  'char': Char,
  'klass': Klass,
  'iKlass': IKlass
};
