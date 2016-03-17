import compile from './compiler';
import Simulator from './simulator';
import parse from './parser';

export default class Rex {
  constructor(expr) {
    // nfa only points to the first state of the nfa
    this.nfa = compile(parse(expr));
  }

  /**
   * Test the input string for a match with the regular expression
   * @param  {String} input string to match
   * @return {Boolean}       whether input matches regula expression
   */
  test(input) {
    let simulator = new Simulator(this.nfa);

    for (let i = 0; i < input.length; i++) {
      simulator.match(input[i]);
    }

    return simulator.done;
  }

  /**
   * Extract the first match in the given input string
   * @param  {String} input string to extract the match from
   * @return {String}       the substring of input that matches the regex
   */
  match(input) {
    let simulator = new Simulator(this.nfa), start, i, end;

    for (i = 0; i < input.length; i++) {
      if (simulator.match(input[i])) {
        // matching started save the start of the substring
        start = start === undefined ? i : start;

        // possible end of match save end of the substring
        if (simulator.done) end = i;
      }
      // matching substring found, break the loop
      else if (end !== undefined) {
        break;
      }
      else {
        // matching failed reset start, end and simulator
        i = start === undefined ? i : start;
        start = undefined;
        simulator = new Simulator(this.nfa);
      }
    }

    // we have both start and end which means we found a
    // matching substring, extract and return it
    if (start !== undefined && end !== undefined &&
      end < input.length) {

      return input.slice(start, end + 1);
    }

    // either start or end of the substring couldn't be found
    return null;
  }
}
