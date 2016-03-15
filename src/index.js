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
}
