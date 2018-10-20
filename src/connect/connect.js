import shallowEqual from '../utils/shallowEqual';
import defaultMapDispatchToPropsFactories from './mapDispatchToProps';
import defaultMapStateToPropsFactories from './mapStateToProps';
import defaultMergePropsFactories from './mergeProps';
import defaultSelectorFactory from './selectorFactory';

function match(arg, factories, name) {
  for (let i = factories.length - 1; i >= 0; i--) {
    const result = factories[i](arg);
    if (result) return result;
  }

  return (dispatch, options) => {
    throw new Error(
      `Invalid value of type ${typeof arg} for ${name} argument when connecting component.`
    );
  };
}

function strictEqual(a, b) {
  return a === b;
}

function noop() {}

export function createConnect(
  connectHOC = noop,
  {
    mapStateToPropsFactories = defaultMapStateToPropsFactories,
    mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
    mergePropsFactories = defaultMergePropsFactories,
    selectorFactory = defaultSelectorFactory,
  } = {}
) {
  return function connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    {
      pure = true,
      areStatesEqual = strictEqual,
      areOwnPropsEqual = shallowEqual,
      areStatePropsEqual = shallowEqual,
      areMergedPropsEqual = shallowEqual,
      ...extraOptions
    } = {}
  ) {
    const initMapStateToProps = match(
      mapStateToProps,
      mapStateToPropsFactories,
      'mapStateToProps'
    );
    const initMapDispatchToProps = match(
      mapDispatchToProps,
      mapDispatchToPropsFactories,
      'mapDispatchToProps'
    );
    const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');

    return connectHOC(selectorFactory, {
      shouldHandleStateChanges: Boolean(mapStateToProps),

      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      areStatesEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areMergedPropsEqual,

      ...extraOptions,
    });
  };
}
