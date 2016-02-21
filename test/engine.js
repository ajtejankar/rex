import Engine from '../src/engine';
import parse from '../src/parser';
import { assert } from 'chai';

function getFirstMatch(engine, input) {
  let state, start, engineInput, char;

  for (let i = 0; i <= input.length; i++) {
    char = input[i];
    engineInput = { char: char, consumed: false };
    state = engine.match(engineInput);

    if (start === undefined && (state === 2 || state === 3)) {
      start = i;
    } else if (state === -1) {
      start = undefined; engine.reset();
    } else if (state === 1) {
       engine.reset();

       return input.slice(start, i);
    }

    if ((state === 2 || state === 3) && char && !engineInput.consumed) i--;
  }

  return '';
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
    assert.equal(output, '');

    input = 'amp';
    output = getFirstMatch(engine, input);
    assert.equal(output, '');
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
    assert.equal(output, 'xpxaaabmmghaaabmmghi');

    input = 'abghi';
    output = getFirstMatch(engine, input);
    assert.equal(output, 'abghi');

    input = 'pefghghii';
    output = getFirstMatch(engine, input);
    assert.equal(output, 'ghghii');

    input = 'pef';
    output = getFirstMatch(engine, input);
    assert.equal(output, '');
  });

  it('should handle grouping of sub-expressions operators', () => {
    let ast = parse('a(bc[de])+');
    let engine = new Engine(ast);
    let input, output;

    input = 'abcdbce';
    output = getFirstMatch(engine, input);
    assert.equal(output, 'abcdbce');
  });
});
