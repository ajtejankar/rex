export default class Simulator {
  constructor(start) {
    // remembers processed states for current
    // iteration in `addState` function
    this.addedStates = new WeakMap();
    // list of states reached by processing current character
    this.nlist = [];
    // populate `nlist` handle the initial empty transitions
    this.addState(start);
    // list of states to process on next character
    this.clist = this.nlist;
    this.nlist = [];
  }

  /**
   * populate the `nlist` with reachable states from current state
   * @param {Split|Primitive} state current state
   */
  addState(state) {
    // exit if state is not defined or already processed
    if (!state || this.addedStates.get(state)) {
      return;
    }

    // remeber the current state as processed
    this.addedStates.set(state, true);

    // if state is of type Split then process both branches
    if (state.split) {
      this.addState(state.out);
      this.addState(state.out1);

      return;
    }

    // if state is of type Primitive then add it to `nlist`
    this.nlist.push(state);
  }

  /**
   * single iteration of matching process, takes a character
   * and for all current states that match the character populates
   * the set of states to be processed next
   * @param  {String} char input character
   * @return {Boolean}      whether match found or not
   */
  match(char) {
    // reset the set of states processed in current iteration
    this.addedStates = new WeakMap();

    // for all current states check if the state can match the character
    // if it can then add all states reachable from it to `nlist`
    this.clist.forEach(state => {
      if (state.match(char)) {
        this.addState(state.out);
      }
    });

    // `nlist` becomes `clist`
    this.clist = this.nlist;
    this.nlist = [];

    // if no states can be processed in next iteration then
    // matching has failed
    return Boolean(this.clist.length);
  }

  /**
   * did matching result in success
   * @return {Boolean} whether matching was successful or not
   */
  get done() {
    return Boolean(this.clist.find(state => state.final));
  }
}
