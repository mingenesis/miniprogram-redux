import context from './ReduxContext';
import Subscription from './utils/Subscription';

export default Behavior({
  lifetimes: {
    created() {
      this._subscription = new Subscription(
        context.store,
        context.subscription
      );
      this._subscription.onStateChange = this._checkForUpdates.bind(this);
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
  observers: {
    '**'() {
      if (this._state === this._prevState) {
        this._checkForUpdates();
      }
    },
  },
  definitionFilter(defFields) {
    const selector = defFields.selector || (() => null);
    const stateDidUpdate = defFields.stateDidUpdate;

    defFields.methods = defFields.methods || {};
    defFields.methods._checkForUpdates = function() {
      const nextState = selector(context.store.getState(), this.data);
      const forceRender = () => {
        if (this._dataSetting) {
          return;
        }

        this._dataSetting = true;
        this._prevState = this._state;
        this._state = this._nextState;

        this.setData(this._state, () => {
          this._dataSetting = undefined;

          if (stateDidUpdate && this._prevState) {
            stateDidUpdate.call(this, this._prevState);
          }
          this._prevState = this._state;

          if (this._nextState !== this._state) {
            forceRender();
          }
        });
      };

      if (nextState === this._state) {
        return;
      }

      this._nextState = nextState;
      forceRender();
    };
  },
});
