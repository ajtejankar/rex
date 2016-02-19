export default class Engine {
  constructor(ast) {
    this.queue = [];
    this.current = 0;
    this.matched = '';
    this.state = 0;
    this.currentState = 0;

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
    // TODO: queue may not always be present
    let queue = this.queue;

    if (this.state === 1 || this.state === -1) return this.state;

    // handle empty and already matched regular expressions
    while(this.current < queue.length && queue[this.current].state === 1) {
      this.current++;
    }

    if (this.current === queue.length) {
      return (this.state = this.currentState !== 1 ? -1 : 1);
    }

    let matcher = queue[this.current];
    this.currentState = matcher.match(char);

    if (this.currentState === -1) {
      return (this.state = -1);
    } else if (this.currentState === 1) {
      this.matched += matcher.matched;
    }

    return (this.state = 2);
  }

  reset() {
    this.current = 0;
    this.matched = '';
    this.state = 0;
    this.currentState = 0;

    // TODO: queue may not always be present
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
    this.state = 0;
    this.operandState = 0;
    this.operand = getMatcher(operand);
    this.next = next || new Engine();
  }

  handleStates(char) {
    let nextState;
    this.operandState = this.operand.match(char);

    if (this.next.state === 1 || this.next.state === -1) {
      nextState = this.next.state;
    } else {
      nextState = this.next.match(char);
    }

    return nextState;
  }

  reset() {
    this.matched = '';
    this.state = 0;
    this.operandState = 0;
  }
}

class ZeroOrMore extends UnaryComplex {
  match(char) {
    let nextState = this.handleStates(char);

    if (this.operandState === -1 && nextState === -1) {
      return (this.state = -1);
    } else if (this.operandState === -1) {

      return (this.state = 1);
    } else if (this.operandState === 1) {
      this.matched += this.operand.matched;
    }

    return (this.state = 2);
  }
}

class ZeroOrOne extends UnaryComplex {
  match(char) {
    let nextState = this.handleStates(char);

    if (this.operandState === -1 && nextState === -1) {

      return (this.state = -1);
    } else if (this.operandState === -1) {

      return (this.state = 1);
    } else if (this.operandState === 1) {
      this.matched = this.operand.matched;

      return (this.state = 1);
    }

    return (this.state = 2);
  }
}

class OneOrMore extends UnaryComplex {
  constructor(operand, next) {
    super(operand, next);
    this.once = false;
  }

  match(char) {
    let nextState = this.handleStates(char);

    if (this.operandState === -1 && nextState === -1) {

      return (this.state = -1);
    } else if (this.operandState === -1 && !this.once) {

      return (this.state = -1);
    } else if (this.operandState === -1 && this.once) {

      return (this.state = 1);
    } else if (this.operandState === 1) {
      this.once = true;
      this.matched += this.operand.matched;
    }

    return (this.state = 2);
  }

  reset() {
    super.reset();
    this.once = false;
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
