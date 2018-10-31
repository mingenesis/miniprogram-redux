export default class Subscription {
  constructor(store, onStateChange) {
    this.store = store;
    this.onStateChange = onStateChange;
    this.unsubscribe = null;
  }

  isSubscribed() {
    return Boolean(this.unsubscribe);
  }

  trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.store.subscribe(this.onStateChange);
    }
  }

  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
