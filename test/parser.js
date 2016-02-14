import parse from '../src/parser';
import { assert } from 'chai';

describe('Regular expression parser', () => {
  it('should handle character sequences', () => {
    let input = 'ab';
    let output = [{
      operator: 'char',
      operand: 'a'
    }, {
      operator: 'char',
      operand: 'b'
    }];

    assert.deepEqual(parse(input), output);
  });


  it('should handle character classes', () => {
    let input = 'ab[cd]';
    let output = [{
      operator: 'char',
      operand: 'a'
    }, {
      operator: 'char',
      operand: 'b'
    }, {
      operator: 'klass',
      operand: 'cd'
    }];

    assert.deepEqual(parse(input), output);
  });

  it('should handle inverse character classes', () => {
    let input = 'ab[cd][^ef]';
    let output = [{
      operator: 'char',
      operand: 'a'
    }, {
      operator: 'char',
      operand: 'b'
    }, {
      operator: 'klass',
      operand: 'cd'
    }, {
      operator: 'iKlass',
      operand: 'ef'
    }];

    assert.deepEqual(parse(input), output);
  });

  it('should handle unary operators', () => {
    let input = 'a*b?[cd]?[^ef]*[gh]+i+';
    let output = [{
      operator: 'zeroOrMore',
      operand: {operator: 'char', operand: 'a'}
    }, {
      operator: 'zeroOrOne',
      operand: {operator: 'char', operand: 'b'}
    }, {
      operator: 'zeroOrOne',
      operand: {operator: 'klass', operand: 'cd'}
    }, {
      operator: 'zeroOrMore',
      operand: {operator: 'iKlass', operand: 'ef'}
    }, {
      operator: 'oneOrMore',
      operand: {operator: 'klass', operand: 'gh'}
    }, {
      operator: 'oneOrMore',
      operand: {operator: 'char', operand: 'i'}
    }];

    assert.deepEqual(parse(input), output);
  });

  it('should handle binary operators', () => {
    let input = 'ab[cd]|ef[^gh]';
    let output = [{
      operator: 'char',
      operand: 'a'
    }, {
      operator: 'char',
      operand: 'b'
    }, {
      operator: 'leftOrRight',
      operand: {
        left: {
          operator: 'klass',
          operand: 'cd'
        },
        right: {
          operator: 'char',
          operand: 'e'
        }
      }
    }, {
      operator: 'char',
      operand: 'f'
    }, {
      operator: 'iKlass',
      operand: 'gh'
    }];

    assert.deepEqual(parse(input), output);
  });

  it('should handle complex combination of operators', () => {
    let input = 'a?|[bc\\]]|[^de]+[\\^]\\+\\?';
    let output = [{
      operator: 'leftOrRight',
      operand: {
        left: {
          operator: 'zeroOrOne',
          operand: { operator: 'char', operand: 'a' }
        },
        right: {
          operator: 'leftOrRight',
          operand: {
            left: {
              operator: 'klass',
              operand: 'bc]'
            },
            right: {
              operator: 'oneOrMore',
              operand: { operator: 'iKlass', operand: 'de' }
            }
          }
        },
      }
    }, {
      operator: 'klass',
      operand: '^'
    }, {
      operator: 'char',
      operand: '+'
    }, {
      operator: 'char',
      operand: '?'
    }];

    assert.deepEqual(parse(input), output);
  });

  it('should handle basic grouping of sub-expressions', () => {
    let input = 'ab[cd](ef[^gh])+[^ij]';
    let output = [{
      operator: 'char',
      operand: 'a'
    }, {
      operator: 'char',
      operand: 'b'
    }, {
      operator: 'klass',
      operand: 'cd'
    }, {
      operator: 'oneOrMore',
      operand: [{
        operator: 'char',
        operand: 'e'
      }, {
        operator: 'char',
        operand: 'f'
      }, {
        operator: 'iKlass',
        operand: 'gh'
      }]
    }, {
      operator: 'iKlass',
      operand: 'ij'
    }];

    assert.deepEqual(parse(input), output);
  });

  it('should handle complex grouping of sub-expressions', () => {
    let input = '(ab[cd])|(ef[^gh])+';
    let output = [{
      operator: 'leftOrRight',
      operand: {
        left: [{
          operator: 'char',
          operand: 'a'
        }, {
          operator: 'char',
          operand: 'b'
        }, {
          operator: 'klass',
          operand: 'cd'
        }],
        right: {
          operator: 'oneOrMore',
          operand: [{
            operator: 'char',
            operand: 'e'
          }, {
            operator: 'char',
            operand: 'f'
          }, {
            operator: 'iKlass',
            operand: 'gh'
          }]
        }
      }
    }];

    assert.deepEqual(parse(input), output);
  });
});
