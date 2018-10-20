export default function(store) {
  return function wrapWithProvider(WrappedConfig = {}) {
    return {
      ...WrappedConfig,

      onLaunch(options) {
        this.store = store;

        if (WrappedConfig.onLaunch) {
          WrappedConfig.onLaunch.call(this, options);
        }
      },
    };
  };
}
