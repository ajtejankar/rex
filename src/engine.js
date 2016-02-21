let classes;

function getMatcher(node) {
  let operator = node.operator || 'engine';
  let operand = node.operand || node;

  operator = operator[0].toUpperCase() + operator.slice(1);

  return new classes[operator](operand);
}

export default class Engine {
  constructor(ast) {
    this.matched = '';

    if (!ast || !ast.length) {
      this.matchers = [];
      this.state = 1;

      return;
    }

    this.matchers = ast.map(node => getMatcher(node));
    this.state = 0;
  }

  match(input) {
    if (this.state === 1 || this.state === -1) return this.state;

    let i = 0;

    for (let matcher; i < this.matchers.length; i++) {
      matcher = this.matchers[i];

      if (matcher.state === 2 || matcher.state === 0) {
        matcher.match(input);

        if (matcher.state === -1) {
          let k;

          for (k = i; k >= 0; k--) {
            if (this.matchers[k].state === 3) break;
          }

          if (k < 0) return (this.state = -1);

          matcher.reset();
        }

        return (this.state = 2);
      }

      if (matcher.state === 3) {
        matcher.match(input);
        continue;
      }

      if (matcher.state === 1) {
        continue;
      }
    }

    i--;

    if ((this.matchers[i].state === 1) ||
        (this.matchers[i].state === 3 && !input.char)) {

       return (this.state = 1);
    }

    if (this.matchers[i].state === 3 && input.char) {
      return (this.state = 3);
    }
  }

  reset() {
    this.matched = '';
    this.state = 0;

    this.matchers.forEach(matcher => matcher.reset());
  }
}

class Primitive {
  constructor(operand) {
    this.matched = '';
    this.operand = operand;
    this.state = 0;
  }

  match(input) {
    let char = input.char;

    if (this._match(char)) {
      this.matched = char || '';
      input.consumed = true;
      this.state = 1;
    } else {
      this.state = -1;
    }

    return this.state;
  }

  reset() {
    this.state = 0;
    this.matched = '';
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

class UnaryComplex {
  constructor(operand) {
    this.matched = '';
    this.operand = getMatcher(operand);
    this.state = this._getInitialState(this.operand.state);
  }

  reset() {
    this.matched = '';
    this.operand.reset();
    this.state = this._getInitialState(this.operand.state);
  }
}

class ZeroOrMore extends UnaryComplex {
  _getInitialState(operandState) {
    return 3;
  }

  match(input) {
    let operandState = this.operand.state;

    if (operandState === 0 || operandState === 2 || operandState === 3) {
      operandState = this.operand.match(input);
    }

    if (operandState === 1 || operandState === 3) {
      this.matched += this.operand.matched;
      this.operand.reset();

      return (this.state = 3);
    }

    if (operandState === 2) {
      return (this.state = 3);
    }

    if (operandState === -1) {
      return (this.state = 1);
    }
  }
}

class ZeroOrOne extends UnaryComplex {
  _getInitialState(operandState) {
    return 3;
  }

  match(input) {
    let operandState = this.operand.state;

    if (operandState === 0 || operandState === 2 || operandState === 3) {
      operandState = this.operand.match(input);
    }

    if (operandState === 1 || operandState === 3) {
      this.matched += this.operand.matched;

      return (this.state = operandState);
    }

    if (operandState === 2) {
      return (this.state = 3);
    }

    if (operandState === -1) {
      return (this.state = 1);
    }
  }
}

class OneOrMore extends UnaryComplex {
  _getInitialState(operandState) {
    if (operandState === 0) {
      return 0;
    }

    return 3;
  }

  match(input) {
    let operandState = this.operand.state;

    if ((this.state === 0 && operandState === 0) ||
        (this.state === 2 && operandState === 2)) {

      this.state = 2;
      operandState = this.operand.match(input);
    }

    if ((this.state === 3 && operandState === 0) ||
        (this.state === 3 && operandState === 2) ||
        (this.state === 3 && operandState === 3)) {

      this.state = 3;
      operandState = this.operand.match(input);
    }

    if (this.state === 2 && operandState === -1) {
      return (this.state = -1);
    }

    if (this.state === 3 && operandState === -1) {
      return (this.state = 1);
    }

    if ((this.state === 3 && operandState === 1) ||
        (this.state === 2 && operandState === 1) ||
        (this.state === 2 && operandState === 3)) {

      this.matched += this.operand.matched;
      this.operand.reset();

      return (this.state = 3);
    }

    return this.state;
  }
}

classes = {
  Engine: Engine,
  Char: Char,
  Klass: Klass,
  IKlass: IKlass,
  ZeroOrMore: ZeroOrMore,
  ZeroOrOne: ZeroOrOne,
  OneOrMore: OneOrMore,
};
