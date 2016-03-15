export default class Simulator {
  constructor(start) {
    this.addedStates = new WeakMap();
    this.nlist = [];
    this.addState(start);
    this.clist = this.nlist;
    this.nlist = [];
  }

  addState(state) {
    if (!state || this.addedStates.get(state)) {
      return;
    }

    this.addedStates.set(state, true);

    if (state.split) {
      this.addState(state.out);
      this.addState(state.out1);

      return;
    }

    this.nlist.push(state);
  }

  match(char) {
    this.addedStates = new WeakMap();
    this.clist.forEach(state => {
      if (state.match(char)) {
        this.addState(state.out);
      }
    });
    this.clist = this.nlist;
    this.nlist = [];

    return Boolean(this.clist.length);
  }

  get done() {
    return Boolean(this.clist.find(state => state.final));
  }
}
