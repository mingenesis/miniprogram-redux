import context from './ReduxContext';
import Subscription from './utils/Subscription';

export default Behavior({
  lifetimes: {
    created() {
      this._subscription = new Subscription(
        context.store,
        context.subscription
      );
      this._subscription.onStateChange = () => this._checkForUpdates();
    },
    attached() {
      this._subscription.trySubscribe();
      this._checkForUpdates();
    },
    detached() {
      this._subscription.tryUnsubscribe();
    },
  },
  pageLifetimes: {
    show() {
      this._subscription.trySubscribe();
      this._checkForUpdates();
    },
    hide() {
      this._subscription.tryUnsubscribe();
    },
  },
  definitionFilter(defFields) {
    const selector = defFields.selector;
    const stateDidUpdate = defFields.stateDidUpdate;

    if (!selector) {
      throw new Error('请实现selector方法');
    }

    defFields.methods = defFields.methods || {};
    defFields.methods._checkForUpdates = checkForUpdates;

    const props = defFields.properties;

    if (props) {
      for (const pKey in props) {
        let pValue = props[pKey];

        if (pValue === null || typeof pValue === 'function') {
          pValue = { type: pValue };
        }

        const { observer } = pValue;

        pValue.observer = function(...args) {
          if (observer) {
            observer.apply(this, args);
          }

          this._checkForUpdates();
        };

        props[pKey] = pValue;
      }
    }

    function checkForUpdates() {
      const nextState = selector(context.store.getState(), { ...this.data });

      if (nextState === this._state) {
        return;
      }

      this._nextState = nextState;
      forceRender.call(this);
    }

    function forceRender() {
      if (this._dataSetting) {
        return;
      }

      this._dataSetting = true;
      this._prevState = this._state;
      this._state = this._nextState;
      this._nextState = undefined;

      this.setData(this._state, () => {
        this._dataSetting = undefined;

        if (stateDidUpdate && this._prevState) {
          stateDidUpdate.call(this, this._prevState);
        }

        if (this._nextState) {
          forceRender.call(this);
        }
      });
    }
  },
});
