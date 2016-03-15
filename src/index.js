import compile from './compiler';
import Simulator from './simulator';
import parse from './parser';

export default class Rex {
  constructor(expr) {
    this.nfa = compile(parse(expr));
  }

  test(input) {
    let simulator = new Simulator(this.nfa);

    for (let i = 0; i < input.length; i++) {
      simulator.match(input[i]);
    }

    return simulator.done;
  }

  match(input) {
    let simulator = new Simulator(this.nfa), start, i, end;

    for (i = 0; i < input.length; i++) {
      if (simulator.match(input[i])) {
        start = start === undefined ? i : start;

        if (simulator.done) end = i;
      }
      else if (end !== undefined) {
        break;
      }
      else {
        i = start === undefined ? i : start;
        start = undefined;
        simulator = new Simulator(this.nfa);
      }
    }

    end = end === undefined ? i : end;

    if (start !== undefined && end < input.length) {
      return input.slice(start, end + 1);
    }

    return null;
  }
}
