export function makeSelectorStateful(sourceSelector, store) {
  // wrap the selector in an object that tracks its results between runs.
  const selector = {
    run(props) {
      const nextProps = sourceSelector(store.getState(), props);

      if (nextProps !== selector.props || selector.error) {
        selector.shouldDataUpdate = true;
        selector.props = nextProps;
      }
    },
    getChangedProps(prevProps = {}) {
      let changed = {};

      for (let propKey in selector.props) {
        if (selector.props[propKey] !== prevProps[propKey]) {
          changed[propKey] = selector.props[propKey];
        }
      }

      return changed;
    },
  };

  return selector;
}
