import Subscription from './utils/Subscription';

const context = {};

export function Provider(store) {
  let subscription = context.subscription;

  if (subscription) {
    subscription.tryUnsubscribe();
    subscription.onStateChange = null;
  }

  subscription = new Subscription(store);
  subscription.onStateChange = subscription.notifyNestedSubs;

  context.store = store;
  context.subscription = subscription;

  subscription.trySubscribe();
}

export function getStore() {
  return context.store;
}

export function dispatch(action) {
  return getStore().dispatch(action);
}

export default context;
