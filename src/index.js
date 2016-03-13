import compile from './compiler';
import Simulator from './simulator';
import parse from './parser';

export default class Rex {
  constructor(expr) {
    this.ast = parse(expr);
  }

  test(input) {
    let nfa = compile(this.ast);
    let simulator = new Simulator(nfa);

    for (let i = 0; i < input.length; i++) {
      simulator.match(input[i]);
    }

    return simulator.done;
  }
}
