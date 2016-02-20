export default class Engine {
  constructor(ast) {
    this.queue = [];
    this.current = 0;
    this.matched = '';
    this.state = 0;

    if (!ast || !ast.length) {
      this.state = 1;

      return;
    }

    for (let i = ast.length - 1, prev, curr; i >= 0; i--) {
      curr = getMatcher(ast[i], prev);
      this.queue.unshift(curr);
      prev = curr;
    }
  }

  match(char) {
    if (this.state === 1 || this.state === -1) return this.state;

    while (!char && this.current < this.queue.length) {
      let matcher = this.queue[this.current];

      this.state = matcher.match();

      if (this.state !== 1) return (this.state = -1);

      this.matched += matcher.matched;
      this.current++;
    }

    while (char && this.current < this.queue.length) {
      let matcher = this.queue[this.current];

      if (matcher.state === -1) return (this.state = -1);

      if (matcher.state === 0 || matcher.state === 2 || matcher.state === 3) {
        this.state = matcher.match(char);

        if (matcher.state === 1) {
          this.current++;
          this.matched += matcher.matched;
        }

        return this.state;
      }

      if (matcher.state === 1) this.matched += matcher.matched;

      this.current++;
    }

    return (this.state = this.queue[this.current - 1].state);
  }

  reset() {
    this.current = 0;
    this.matched = '';
    this.state = 0;

    for (let i = 0; i < this.queue.length; i++) {
      this.queue[i].reset();
    }
  }
}

class Primitive {
  constructor(operand) {
    this.matched = '';
    this.operand = operand;
    this.state = 0;
  }

  reset() {
    this.state = 0;
    this.matched = '';
  }
}

class Char extends Primitive {
  match(char) {
    if (char === this.operand) {
      this.matched = char;
      this.state = 1;
    } else {
      this.state = -1;
    }

    return this.state;
  }
}

class Klass extends Primitive {
  match(char) {
    if (this.operand.indexOf(char) !== -1) {
      this.matched = char;
      this.state = 1;
    } else {
      this.state = -1;
    }

    return this.state;
  }
}

class IKlass extends Primitive {
  match(char) {
    if (this.operand.indexOf(char) === -1) {
      this.matched = char;
      this.state = 1;
    } else {
      this.state = -1;
    }

    return this.state;
  }
}

class UnaryComplex {
  constructor(operand, next) {
    this.matched = '';
    this.operand = getMatcher(operand);
    this.state = this.operand.state;
    this.next = next || new Engine();
  }

  reset() {
    this.matched = '';
    this.operand.reset();
    this.state = this.operand.state;
  }
}

class ZeroOrMore extends UnaryComplex {
  match(char) {
    let state;

    if (!char) {
      if (this.state === 2) state = this.operand.match();

      if (state === 1) {
        this.next.reset();
        this.matched += this.operand.matched;
      }

      return (this.state = 1);
    }

    state = this.operand.match(char);
    let nextState = this.next.state;

    if (nextState !== 1 || nextState !== -1) nextState = this.next.match(char);

    if (state === 1) {
      this.operand.reset();
      this.matched += this.operand.matched;

      return (this.state = 3);
    }

    if (state === -1) return (this.state = 1);

    return (this.state = 2);
  }
}

class ZeroOrOne extends UnaryComplex {
  match(char) {
    let state;

    if (!char) {
      if (this.state === 2) state = this.operand.match();

      if (state === 1) {
        this.next.reset();
        this.matched += this.operand.matched;
      }

      return (this.state = 1);
    }

    state = this.operand.match(char);
    let nextState = this.next.state;

    if (nextState !== 1 || nextState !== -1) nextState = this.next.match(char);

    if (state === 1) {
      this.next.reset();
      this.matched += this.operand.matched;

      return (this.state = 1);
    }

    if (state === -1) return (this.state = 1);

    return (this.state = 2);
  }
}

class OneOrMore extends UnaryComplex {
  match(char) {
    let state;

    if (!char) {
      if (this.state === 2) state = this.operand.match();

      if (state === 1 || state === 3) {
        this.next.reset();
        this.matched += this.operand.matched;

        return (this.state = 1);
      }

      if (this.state === 3) return (this.state = 1);

      return (this.state = -1);
    }

    state = this.operand.match(char);
    let nextState = this.next.state;

    if (nextState !== 1 || nextState !== -1) nextState = this.next.match(char);

    if (state === 1) {
      this.operand.reset();
      this.next.reset();
      this.matched += this.operand.matched;

      return (this.state = 3);
    }

    if (state === -1 && this.once) return (this.state = 1);

    if (state === -1) return (this.state = -1);

    return (this.state = 2);
  }
}

function getMatcher(node, next) {
  let operand = node.operand;
  let operator = node.operator;
  let matcher;

  switch(operator) {
    case 'char':
      matcher = new Char(operand);
      break;

    case 'klass':
      matcher = new Klass(operand);
      break;

    case 'iKlass':
      matcher = new IKlass(operand);
      break;

    case 'oneOrMore':
      matcher = new OneOrMore(operand, next);
      break;

    case 'zeroOrMore':
      matcher = new ZeroOrMore(operand, next);
      break;

    case 'zeroOrOne':
      matcher = new ZeroOrOne(operand, next);
      break;

    case 'leftOrRight':
      matcher = new LeftOrRight(operand, next);
      break;

    default:
      matcher = new Engine(operand);
  }

  return matcher;
}
