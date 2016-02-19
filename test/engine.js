import Engine from '../src/engine';
import parse from '../src/parser';
import { assert } from 'chai';

function getFirstMatch(engine, input) {
  let state, matched;

  for (let i = 0; i < input.length; i++) {
    state = engine.match(input[i]);

    if (state === -1) {
      engine.reset();
    } else if (state === 1) {
       matched = engine.matched;
       engine.reset();

       return matched;
    }
  }
}

describe('Regular expression engine', () => {
  it('should handle primitive operations', () => {
    let ast = parse('ab[cd][^ef]');
    let engine = new Engine(ast);

    let input = 'xabcsxabcmd';
    let output = getFirstMatch(engine, input);
    assert.equal(output, 'abcs');

    input = 'acdmabcxp';
    output = getFirstMatch(engine, input);
    assert.equal(output, 'abcx');
  });

  it('should handle unary operators', () => {
    let ast = parse('a*b?[cd]?[^ef]*[gh]+i+');
    let engine = new Engine(ast);
    let input, output;

    input = 'gi';
    output = getFirstMatch(engine, input);
    assert.equal(output, 'gi');

    input = 'xpxaaabmmghaaabmmghimp';
    output = getFirstMatch(engine, input);
    assert.equal(output, 'aaabmmghi');
  });
});
