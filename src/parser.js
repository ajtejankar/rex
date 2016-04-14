// TODO: Error handling. Empty regular expressions.
// TODO: Error handling. Empty operands to unary operators.

// rules is map of a character and a function
// it describes the state machine for parsing
// regular expressions
let rules = new Map();

// the function mapped to a character is executed
// by the parser to make transitions in the state machine
rules.set('(', function(state) {
  // handle the character only if currently in start state
  if (state.name === 'START') {
    // parse the sub-expression first
    state.stack.push({ast: state.ast});
    state.ast = [];

    // some sort of handling was done
    return true;
  }
});

rules.set(')', function(state) {
  if (state.name === 'START') {
    // pop the previous ast and push the
    // parsed sub-expression on it
    let prevAst = state.stack.pop().ast;
    prevAst.push(state.ast);
    state.ast = prevAst;

    return true;
  }
});

rules.set('[', function(state) {
  if (state.name === 'START') {
    state.name = 'CLASS';
    state.ast.push({operator: 'klass', operand: ''});

    return true;
  }
});

rules.set(']', function(state) {
  if (state.name === 'CLASS' || state.name === 'I_CLASS') {
    state.name = 'START';

    return true;
  }
});

rules.set('.', function(state) {
  if (state.name === 'START') {
    state.ast.push({operator: 'any', operand: null});

    return true;
  }
});

rules.set('^', function(state) {
  let prevNode = state.ast[state.ast.length - 1];

  // make sure that `^` comes immediately after `[`
  if (state.name === 'CLASS' && !prevNode.operand.length) {
    // change the state to inverse class type
    state.name = 'I_CLASS';
    prevNode.operator = 'iKlass';

    return true;
  }
});

rules.set('\\', function(state) {
  // push current state on stack and change to escape state
  // the state is popped back on next character
  state.stack.push({stateName: state.name});
  state.name = 'ESCAPE';

  return true;
});

rules.set('?', function(state) {
  if (state.name === 'START') {
    let operand = state.ast.pop();
    state.ast.push({operator: 'zeroOrOne', operand: operand});

    return true;
  }
});

rules.set('*', function(state) {
  if (state.name === 'START') {
    let operand = state.ast.pop();
    state.ast.push({operator: 'zeroOrMore', operand: operand});

    return true;
  }
});

rules.set('+', function(state) {
  if (state.name === 'START') {
    let operand = state.ast.pop();
    state.ast.push({operator: 'oneOrMore', operand: operand});

    return true;
  }
});

rules.set('|', function(state) {
  if (state.name === 'START') {
    state.ast.push({
      operator: 'leftOrRight',
      operand: {left: state.ast.pop()}
    });

    // since we don't have the right operand yet
    // mark the current ast node to be filled with right
    // operand later when parsing is complete
    state.queue.push({
      ast: state.ast,
      index: state.ast.length - 1
    });

    return true;
  }
});

// execute this rule if none rules could handle the character
function defaultRule(state, char) {
  // pop back the state before escape state
  if (state.name === 'ESCAPE') {
    state.name = state.stack.pop().stateName;
  }

  // patch up the class and inverse class operands
  if (state.name === 'CLASS' || state.name === 'I_CLASS') {
    state.ast[state.ast.length - 1].operand += char;

    return true;
  } else if (state.name === 'START') {
    state.ast.push({operator: 'char', operand: char});

    return true;
  }
}

/**
 * takes the regular expression string as input and parses
 * it into an ast
 * @param  {String} input regex string
 * @return {Object}       ast
 */
export default function parse(input) {
  // initialize the state for state machine
  let state = { name: 'START', ast: [], stack: [], queue: [] };
  let execDefault;

  // iterate through the regex string character by
  // character and set up ast
  for (let i = 0; i < input.length; i++) {
    // execute the default rule by default
    execDefault = true;

    // iterate through all rules and see if the
    // character was handled by rule
    for (let rule of rules) {
      if (rule[0] === input[i] && rule[1](state)) {
        // since character is handled by the current
        // rule don't execute the default rule and break the loop
        execDefault = false;
        break;
      }
    }

    // execute the default rule and if it fails to handle the
    // character then the state machine is in an invalid state
    if (execDefault && !defaultRule(state, input[i])) {
      throw new Error(`Parsing Error`);
    }
  }

  // the state machine has to return back to the start state by end
  if (state.name !== 'START') {
    throw new Error(`Parsing Error`);
  }

  // set up the right operands for binary operators
  for (let item of state.queue) {
    let ast = item.ast;
    let index = item.index;

    ast[index].operand.right = ast[index + 1];
  }

  // remove the right operands from ast since they have been
  // addes and operands in the previous loop
  for (let i = 0; i < state.queue.length; i++) {
    state.queue[i].ast.splice(state.queue[i].index + 1 - i, 1);
  }

  return state.ast;
}
