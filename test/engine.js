import Engine from '../src/engine';
import parse from '../src/parser';
import { assert } from 'chai';

function getFirstMatch(engine, input) {
  for (let i = 0, state; i <= input.length; i++) {
    state = engine.match({char: input[i], index: i});

    if (state === -1) {
      engine.reset();
    }

    else if (state === 1) {
      let matched = engine.matched;
      engine.reset();

      return matched;
    }
  }

  return null;
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

    input = 'abmcg';
    output = getFirstMatch(engine, input);
    assert.equal(output, null);

    input = 'amp';
    output = getFirstMatch(engine, input);
    assert.equal(output, null);
  });

  // it('should handle unary operators', () => {
  //   let ast = parse('a*b?[cd]?[^ef]*[gh]+i+');
  //   let engine = new Engine(ast);
  //   let input, output;

  //   input = 'gi';
  //   output = getFirstMatch(engine, input);
  //   assert.equal(output, 'gi');

  //   input = 'xpxaaabmmghaaabmmghimp';
  //   output = getFirstMatch(engine, input);
  //   assert.equal(output, 'xpxaaabmmghaaabmmghi');

  //   input = 'abghi';
  //   output = getFirstMatch(engine, input);
  //   assert.equal(output, 'abghi');

  //   input = 'pefghghii';
  //   output = getFirstMatch(engine, input);
  //   assert.equal(output, 'ghghii');

  //   input = 'pef';
  //   output = getFirstMatch(engine, input);
  //   assert.equal(output, null);
  // });

  // it('should handle grouping of sub-expressions operators', () => {
  //   let ast = parse('a(bc[de])+');
  //   let engine = new Engine(ast);
  //   let input, output;

  //   input = 'abcdbce';
  //   output = getFirstMatch(engine, input);
  //   assert.equal(output, 'abcdbce');
  // });
});
