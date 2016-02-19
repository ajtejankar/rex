// TODO: Error handling. Empty regular expressions.
// TODO: Error handling. Empty operands to unary operators.

let rules = new Map();

rules.set('(', function(state) {
  if (state.name === 'START') {
    state.stack.push({ast: state.ast});
    state.ast = [];

    return true;
  }
});

rules.set(')', function(state) {
  if (state.name === 'START') {
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

rules.set('^', function(state) {
  if (state.name === 'CLASS') {
    state.name = 'I_CLASS';
    state.ast[state.ast.length - 1].operator = 'iKlass';

    return true;
  }
});

rules.set('\\', function(state) {
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

    state.queue.push({
      ast: state.ast,
      index: state.ast.length - 1
    });

    return true;
  }
});

function defaultRule(state, char) {
  if (state.name === 'ESCAPE') {
    state.name = state.stack.pop().stateName;
  }

  if (state.name === 'CLASS' || state.name === 'I_CLASS') {
    state.ast[state.ast.length - 1].operand += char;

    return true;
  } else if (state.name === 'START') {
    state.ast.push({operator: 'char', operand: char});

    return true;
  }
}

export default function parse(input) {
  let state = { name: 'START', ast: [], stack: [], queue: [] };
  let execDefault;

  for (let i = 0; i < input.length; i++) {
    execDefault = true;

    for (let rule of rules) {
      if (rule[0] === input[i] && rule[1](state)) {
        execDefault = false;
        break;
      }
    }

    if (execDefault && !defaultRule(state, input[i])) {
      throw new Error(`Parsing Error`);
    }
  }

  if (state.name !== 'START') {
    throw new Error(`Parsing Error`);
  }

  for (let item of state.queue) {
    let ast = item.ast;
    let index = item.index;

    ast[index].operand.right = ast[index + 1];
  }

  for (let i = 0; i < state.queue.length; i++) {
    state.queue[i].ast.splice(state.queue[i].index + 1 - i, 1);
  }

  return state.ast;
}
