export default class Simulator {
  constructor(start) {
    this.listid = 1;
    this.nlist = [];
    this.addState(start);
    this.clist = this.nlist;
    this.nlist = [];
  }

  addState(state) {
    if (!state || state.lastlist === this.listid) {
      return;
    }

    state.lastlist = this.listid;

    // this is a split state
    if (state.split) {
      this.addState(state.out);
      this.addState(state.out1);

      return;
    }

    this.nlist.push(state);
  }

  match(char) {
    this.listid++;
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
