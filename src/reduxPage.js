import Subscription from './utils/Subscription';
import Selector from './utils/Selector';
import { createConnect } from './connect/connect';

function reduxPage(
  selectorFactory,
  { shouldHandleStateChanges = true, ...connectOptions }
) {
  return function wrapWithConnect(WrappedConfig = {}) {
    const app = getApp();
    const store = app.store;

    return {
      ...WrappedConfig,

      onLoad(options) {
        /* init selector */
        const sourceSelector = selectorFactory(store.dispatch, connectOptions);
        this.selector = new Selector(store, sourceSelector);

        let rendering = false;
        const renderUI = prevProps => {
          if (rendering) {
            return;
          }
          rendering = true;
          this.selector.shouldDataUpdate = false;

          let changedData = {};

          for (let propKey in this.selector.props) {
            if (this.selector.props[propKey] !== this.data[propKey]) {
              changedData[propKey] = this.selector.props[propKey];
            }
          }

          this.setData(changedData, () => {
            rendering = false;

            if (this.selector.shouldDataUpdate) {
              renderUI(prevProps);
              return;
            }

            if (prevProps) {
              if (WrappedConfig.dataDidUpdate) {
                WrappedConfig.dataDidUpdate.call(this, prevProps);
              }
            }
          });
        };

        this.syncUI = function() {
          const prevProps = this.selector.props;
          this.selector.run(this.options);

          if (this.selector.shouldDataUpdate) {
            renderUI(prevProps);
          }
        };

        /* init subscription */
        if (shouldHandleStateChanges) {
          this.subscription = new Subscription(store, this.syncUI.bind(this));
        }

        this.syncUI();

        if (WrappedConfig.onLoad) {
          WrappedConfig.onLoad.call(this, options);
        }
      },

      onReady() {
        if (this.subscription) {
          this.subscription.trySubscribe();
        }

        if (WrappedConfig.onReady) {
          WrappedConfig.onReady.call(this);
        }
      },

      onShow() {
        this.syncUI();

        if (this.subscription) {
          this.subscription.trySubscribe();
        }

        if (WrappedConfig.onShow) {
          WrappedConfig.onShow.call(this);
        }
      },

      onHide() {
        if (this.subscription) {
          this.subscription.tryUnsubscribe();
        }

        if (WrappedConfig.onHide) {
          WrappedConfig.onHide.call(this);
        }
      },

      onUnload() {
        if (this.subscription) {
          this.subscription.tryUnsubscribe();
        }

        this.subscription = null;
        this.selector = null;

        if (WrappedConfig.onUnload) {
          WrappedConfig.onUnload.call(this);
        }
      },
    };
  };
}

export default createConnect(reduxPage);
