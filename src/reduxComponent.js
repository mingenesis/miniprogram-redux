import Subscription from './utils/Subscription';
import Selector from './utils/Selector';
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
          this.selector = new Selector(store, sourceSelector);

          let doingSetData = false;
          const updateData = prevProps => {
            if (doingSetData) {
              return;
            }

            doingSetData = true;
            this.selector.shouldDataUpdate = false;

            const nextProps = this.selector.props;
            let changedData = {};

            for (let propKey in nextProps) {
              if (!(prevProps && prevProps[propKey] === nextProps[propKey])) {
                changedData[propKey] = nextProps[propKey];
              }
            }

            this.setData(changedData, () => {
              doingSetData = false;

              if (prevProps) {
                if (WrappedConfig.dataDidUpdate) {
                  WrappedConfig.dataDidUpdate.call(this, prevProps);
                }
              }

              if (this.selector.shouldDataUpdate) {
                updateData(nextProps);
              }
            });
          };

          this.syncUI = () => {
            const prevProps = this.selector.props;

            let ownProps = {};

            for (let propKey in properties) {
              ownProps[propKey] = this.data[propKey];
            }

            this.selector.run(ownProps);

            if (this.selector.shouldDataUpdate) {
              updateData(prevProps);
            }
          };

          /* init subscription */
          if (shouldHandleStateChanges) {
            this.subscription = new Subscription(store, this.syncUI.bind(this));
          }

          if (lifetimes.created) {
            lifetimes.created.call(this);
          }
        },

        attached() {
          this.syncUI();

          if (this.subscription) {
            this.subscription.trySubscribe();
          }

          if (lifetimes.attached) {
            lifetimes.attached.call(this);
          }
        },

        detached() {
          if (this.subscription) {
            this.subscription.tryUnsubscribe();
          }

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
