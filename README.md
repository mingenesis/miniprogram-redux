# miniprogram-redux

Wechat Miniprogram bindings for [Redux](https://github.com/mingenesis/miniprogram-redux).

[![npm version](https://img.shields.io/npm/v/miniprogram-redux.svg?style=flat-square)](https://www.npmjs.com/package/miniprogram-redux)

## Installation

Miniprogram Redux requires **Wechat Miniprogram 2.2.3 or later.**
```
npm install --save miniprogram-redux
```

## The Gist

```js
/* app.js */
const { reduxApp } = require('miniprogram-redux');
const { createStore } = require('redux');

function rootReducer(state = { message: '' }, action) {
  switch (action.type) {
    case 'REFRESH':
      return {
        ...state,
        message: 'Loading...'
      };
    default:
      return state;
  }
}

const store = createStore(rootReducer);

App(reduxApp(store)({
  onLaunch() {}
}));

/* pages/home.js */
const { reduxPage } = require('miniprogram-redux');

Page(reduxPage(
  state => ({ message: state.message })
)({
  onReady() {}
}))

/* ui/home.js */
const { reduxComponent } = require('miniprogram-redux');

Component(reduxComponent(
  state => ({ message: state.message })
)({
  lifetimes: {
    ready() {}
  }
}))
```

## License

MIT
