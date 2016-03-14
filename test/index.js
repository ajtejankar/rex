import Rex from '../src/';
import { assert } from 'chai';

describe('Regular expression test api', () => {
  it('should handle primitive operations', () => {
    let re = new Rex('ab[cd][^ef]');

    assert.equal(re.test('abdg'), true);
    assert.equal(re.test('abcghi'), false);
    assert.equal(re.test('amp'), false);
  });

  it('should handle unary operators', () => {
    let re = new Rex('a*b?[cd]?[^ef]*[gh]+i+');

    assert.equal(re.test('gi'), true);
    assert.equal(re.test('xpxaaabmmghaaabmmghi'), true);
    assert.equal(re.test('abghi'), true);
    assert.equal(re.test('ghghii'), true);
    assert.equal(re.test('egi'), false);
  });

  it('should handle grouping of sub-expressions operators', () => {
    let re = new Rex('a(bc*[de]?)+');

    assert.equal(re.test('abcdbcebbc'), true);
  });
});
