import Subscription from './utils/Subscription';

const context = {};

function notifySubscribers() {
  context.subscription.notifyNestedSubs();
}

export function Provider(store) {
  if (context.store) {
    context.subscription.tryUnsubscribe();
  }

  context.store = store;
  context.subscription = new Subscription(store);
  context.subscription.onStateChange = notifySubscribers;
  context.subscription.trySubscribe();
}

export function getStore() {
  return context.store;
}

export function dispatch(action) {
  return getStore().dispatch(action);
}

export default context;
