import Rex from '../src/';
import { assert } from 'chai';

describe('Regular expression test api', () => {
  it('should handle primitive operations', () => {
    let re = new Rex('ab[cd][^ef]');

    assert.isTrue(re.test('abdg'));
    assert.isFalse(re.test('abcghi'));
    assert.isFalse(re.test('amp'));
  });

  it('should handle unary operators', () => {
    let re = new Rex('a*b?[cd]?[^ef]*[gh]+i+');

    assert.isTrue(re.test('gi'));
    assert.isTrue(re.test('xpxaaabmmghaaabmmghi'));
    assert.isTrue(re.test('abghi'));
    assert.isTrue(re.test('ghghii'));
    assert.isFalse(re.test('egi'));
  });

  it('should handle grouping of sub-expressions operators', () => {
    let re = new Rex('a(bc*[de]?)+');

    assert.isTrue(re.test('abcd'));
    assert.isTrue(re.test('abcdbcebbc'));
    assert.isFalse(re.test('amdp'));
  });
});

describe('Regular expression match api', () => {
  it('should handle primitive operations', () => {
    let re = new Rex('ab[cd][^ef]');

    assert.equal(re.match('abdg'), 'abdg');
    assert.equal(re.match('xababceabcp'), 'abcp');
    assert.equal(re.match('xababceabcpmda'), 'abcp');
    assert.equal(re.match('xman'), null);
  });

  it('should handle unary operators', () => {
    let re = new Rex('a*b?[^ef]*[gh]+');

    assert.equal(re.match('gh'), 'gh');
    assert.equal(re.match('xyxygh'), 'xyxygh');
    assert.equal(re.match('abxyxyghp'), 'abxyxygh');
    assert.equal(re.match('eeabxyxyghp'), 'abxyxygh');
    assert.equal(re.match('triptoport'), null);
  });

  it('should handle sub-expressions grouping', () => {
    let re = new Rex('a(bc*[de]?)+');

    assert.equal(re.match('abcd'), 'abcd');
    assert.equal(re.match('xpaabcdbce'), 'abcdbce');
    assert.equal(re.match('xpaaa'), null);
  });
});
