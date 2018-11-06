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

          const nextProps = this.selector.props;
          let changedData = {};

          for (let propKey in nextProps) {
            if (!(prevProps && prevProps[propKey] === nextProps[propKey])) {
              changedData[propKey] = nextProps[propKey];
            }
          }

          this.setData(changedData, () => {
            rendering = false;

            if (prevProps) {
              if (WrappedConfig.dataDidUpdate) {
                WrappedConfig.dataDidUpdate.call(this, prevProps);
              }
            }

            if (this.selector.shouldDataUpdate) {
              renderUI(nextProps);
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

        if (this.subscription) {
          this.subscription.trySubscribe();
        }

        if (WrappedConfig.onLoad) {
          WrappedConfig.onLoad.call(this, options);
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

        if (WrappedConfig.onUnload) {
          WrappedConfig.onUnload.call(this);
        }
      },
    };
  };
}

export default createConnect(reduxPage);
