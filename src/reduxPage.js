import Subscription from './utils/Subscription';
import { makeSelectorStateful } from './utils/Selector';
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
        this.selector = makeSelectorStateful(sourceSelector, store);

        this.syncUI = function() {
          const prevProps = this.selector.props;
          this.selector.run(this.options);

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
        this.selector.run = () => {};
        this.selector.shouldDataUpdate = false;

        if (WrappedConfig.onUnload) {
          WrappedConfig.onUnload.call(this);
        }
      },
    };
  };
}

export default createConnect(reduxPage);
