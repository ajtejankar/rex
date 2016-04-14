// nfa state that can match a character
class Primitive {
  constructor(out, type, operand) {
    // the next state in nfa
    this.out = out;
    // specifies how to match a character
    this.type = type;
    // against what should the character be matched
    this.operand = operand;
  }

  /**
   * takes a character as input and returns if it
   * succesfully matched with operand based on type
   * @param  {String} char input character
   * @return {Boolean}      whether matching succeded or not
   */
  match(char) {
    if (this.type === 'char') {
      // character should match exactly with the operand
      return this.operand === char;
    }
    else if (this.type === 'klass') {
      // character should be found inside the operand
      return this.operand.indexOf(char) > -1;
    }
    else if (this.type === 'iKlass') {
      // the character should not be found inside the operand
      return this.operand.indexOf(char) === -1;
    }
    else if (this.type === 'any') {
      return true;
    }
  }
}

// nfa state that can make an empty transition
// the empty transition is made to either of its branches
class Split {
  constructor(out, out1) {
    // first branch of this state
    this.out = out;
    // second branch of this state
    this.out1 = out1;
    this.split = true;
  }

  /**
   * this state does no matching
   * @return {Boolean} always return false
   */
  match() {
    return false;
  }
}

/**
 * Takes ast, the data structure representing parsed
 * regex and creates nfa out of it.
 * @param  {Object}   ast  parsed regex
 * @param  {Object} next used in recursion, it next reachable state
 * @return {Object}        start state of the nfa
 */
export default function compile(ast, next) {
  // initially the `next` will be the final state
  next = next || {final: true, match: () => false};
  // ast should always be an array, convert it if necessary
  ast = ast instanceof Array ? ast : [ast];

  // iterate through the ast in reverse manner
  for (let i = ast.length - 1, node; i >= 0; i--) {
    // compile the current node
    node = ast[i];

    // if the node is a sub-expression then compile it
    if (node instanceof Array) {
      next = compile(node, next);
    }

    // create a primitive state for primitive node
    // https://swtch.com/~rsc/regexp/fig15.png
    else if (node.operator === 'char' ||
        node.operator === 'klass' ||
        node.operator === 'any' ||
        node.operator === 'iKlass') {

      next = new Primitive(next, node.operator, node.operand);
    }

    // https://swtch.com/~rsc/regexp/fig17.png
    else if (node.operator === 'zeroOrOne') {
      let operandState = compile(node.operand, next);
      next = new Split(operandState, next);
    }

    // https://swtch.com/~rsc/regexp/fig18.png
    else if (node.operator === 'zeroOrMore') {
      next = new Split(undefined, next);
      let operandState = compile(node.operand, next);
      next.out = operandState;
    }

    // https://swtch.com/~rsc/regexp/fig19.png
    else if (node.operator === 'oneOrMore') {
      let operatorState = new Split(undefined, next);
      next = compile(node.operand, operatorState);
      operatorState.out = next;
    }

    // https://swtch.com/~rsc/regexp/fig16.png
    else if (node.operator === 'leftOrRight') {
      let left = compile(node.operand.left, next);
      let right = compile(node.operand.right, next);
      next = new Split(left, right);
    }
  }

  // return start of the nfa built in this compilation step
  return next;
}
