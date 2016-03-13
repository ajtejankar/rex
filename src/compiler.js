class Primitive {
  constructor(out, type, operand) {
    this.out = out;
    this.type = type;
    this.operand = operand;
  }

  match(char) {
    if (this.type === 'char') {
      return this.operand === char;
    }
    else if (this.type === 'klass') {
      return this.operand.indexOf(char) > -1;
    }
    else if (this.type === 'iKlass') {
      return this.operand.indexOf(char) === -1;
    }
  }
}

class Split {
  constructor(out, out1) {
    this.out = out;
    this.out1 = out1;
    this.split = true;
  }

  match() {
    return false;
  }
}

export default function compile(ast, next) {
  next = next || {final: true, match: () => false};
  ast = ast instanceof Array ? ast : [ast];

  for (let i = ast.length - 1, node; i >= 0; i--) {
    node = ast[i];

    if (node instanceof Array) {
      next = compile(node, next);
    }

    else if (node.operator === 'char' ||
        node.operator === 'klass' ||
        node.operator === 'iKlass') {

      next = new Primitive(next, node.operator, node.operand);
    }

    else if (node.operator === 'zeroOrOne') {
      let operandState = compile(node.operand, next);
      next = new Split(operandState, next);
    }

    else if (node.operator === 'zeroOrMore') {
      next = new Split(undefined, next);
      let operandState = compile(node.operand, next);
      next.out = operandState;
    }

    else if (node.operator === 'oneOrMore') {
      let operatorState = new Split(undefined, next);
      next = compile(node.operand, operatorState);
      operatorState.out = next;
    }

    else if (node.operator === 'leftOrRight') {
      let left = compile(node.operand.left, next);
      let right = compile(node.operand.right, next);
      next = new Split(left, right);
    }
  }

  return next;
}
