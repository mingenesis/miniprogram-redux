export default class Selector {
  constructor(store, sourceSelector) {
    this.store = store;
    this.sourceSelector = sourceSelector;
    this.props = null;
    this.shouldDataUpdate = false;
  }

  run(props) {
    const nextProps = this.sourceSelector(this.store.getState(), props);

    if (nextProps !== this.props) {
      this.shouldDataUpdate = true;
      this.props = nextProps;
    }
  }
}
