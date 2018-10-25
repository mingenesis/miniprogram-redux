const { reduxPage } = require('miniprogram-redux');

Page(
  reduxPage(state => ({ value: state }), {
    onIncrement: () => ({ type: 'INCREMENT' }),
    onDecrement: () => ({ type: 'DECREMENT' }),
  })({
    handleIncrement() {
      this.data.onIncrement();
    },

    handleDecrement() {
      this.data.onDecrement();
    },

    handleIncrementIfOdd() {
      if (this.data.value % 2 !== 0) {
        this.data.onIncrement();
      }
    },

    handleIncrementAsync() {
      setTimeout(this.data.onIncrement, 1000);
    },
  })
);
