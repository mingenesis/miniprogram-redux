import Subscription from './utils/Subscription';
import { makeSelectorStateful } from './utils/Selector';
import { createConnect } from './connect/connect';

function reduxComponent(
  selectorFactory,
  { shouldHandleStateChanges = true, ...connectOptions }
) {
  return function wrapWithConnect(WrappedConfig = {}) {
    const app = getApp();
    const store = app.store;

    const lifetimes = WrappedConfig.lifetimes || {};
    const pageLifetimes = WrappedConfig.pageLifetimes || {};
    let properties = {};

    if (WrappedConfig.properties) {
      for (let propertyKey in WrappedConfig.properties) {
        let property = WrappedConfig.properties[propertyKey];

        if (typeof property === 'function' || property === null) {
          property = { type: property };
        }

        properties[propertyKey] = {
          ...property,
          observer(newVal, oldVal, changedPath) {
            this.syncUI();

            if (property.observer) {
              property.observer.call(this, newVal, oldVal, changedPath);
            }
          },
        };
      }
    }

    return {
      ...WrappedConfig,

      properties,

      lifetimes: {
        ...lifetimes,

        created() {
          /* init selector */
          const sourceSelector = selectorFactory(
            store.dispatch,
            connectOptions
          );
          this.selector = makeSelectorStateful(sourceSelector, store);

          this.syncUI = () => {
            const prevProps = this.selector.props;
            this.selector.run({ ...this.data });

            if (this.selector.shouldDataUpdate) {
              this.setData(this.selector.getChangedProps(prevProps), () => {
                this.selector.shouldDataUpdate = false;

                if (prevProps) {
                  if (WrappedConfig.dataDidUpdate) {
                    WrappedConfig.dataDidUpdate.call(this, prevProps);
                  }
                }
              });
            }
          };

          /* init subscription */
          if (shouldHandleStateChanges) {
            this.subscription = new Subscription(
              store,
              null,
              this.syncUI.bind(this)
            );
          }

          if (lifetimes.created) {
            lifetimes.created.call(this);
          }
        },

        attached() {
          this.syncUI();

          if (lifetimes.attached) {
            lifetimes.attached.call(this);
          }
        },

        ready() {
          if (this.subscription) {
            this.subscription.trySubscribe();
          }

          if (lifetimes.ready) {
            lifetimes.ready.call(this);
          }
        },

        detached() {
          if (this.subscription) {
            this.subscription.tryUnsubscribe();
          }
          this.subscription = null;
          this.selector.run = () => {};
          this.selector.shouldDataUpdate = false;

          if (lifetimes.detached) {
            lifetimes.detached.call(this);
          }
        },
      },

      pageLifetimes: {
        ...pageLifetimes,

        show() {
          this.syncUI();

          if (this.subscription) {
            this.subscription.trySubscribe();
          }

          if (pageLifetimes.show) {
            pageLifetimes.show.call(this);
          }
        },

        hide() {
          if (this.subscription) {
            this.subscription.tryUnsubscribe();
          }

          if (pageLifetimes.hide) {
            pageLifetimes.hide.call(this);
          }
        },
      },
    };
  };
}

export default createConnect(reduxComponent);
