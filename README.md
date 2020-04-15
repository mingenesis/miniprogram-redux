# miniprogram-redux

Wechat Miniprogram bindings for [Redux](https://github.com/mingenesis/miniprogram-redux).

[![npm version](https://img.shields.io/npm/v/miniprogram-redux.svg)](https://www.npmjs.com/package/miniprogram-redux)
![npm license](https://img.shields.io/npm/l/miniprogram-redux.svg)

## Getting Started

Miniprogram Redux requires **Wechat Miniprogram 2.2.3 or later.**

Install `miniprogram-redux` using npm.

```shell
npm install --save miniprogram-redux
```

## The Gist

```js
/* app.js */
const { Provider, Redux } = require('miniprogram-redux');

function reducer(state = {}, action) {
  switch (action.type) {
    case 'LOAD_TOPIC':
      return { ...state, [action.topicId]: { loading: true } };
    case 'LOAD_TOPIC_COMPLETION':
      return { ...state, [action.topicId]: { loading: false } };
    default:
      return state;
  }
}

const store = Redux.createStore(reducer);

App({
  onLaunch() {
    Provider(store);
  },
});

/* pages/home.js */
const { selector, dispatch, Reselect } = require('miniprogram-redux');
const stateSelector = Reselect.createSelector(
  (state, data) => state[data.topicId],
  topic => topic
);

Component({
  behaviors: [selector],
  selector: (state, data) => stateSelector(state, data),
  stateDidUpdate(prevState) {
    if (prevState.loading !== this.data.loading) {
      if (this.data.loading) {
        console.log('Fetching topic.');
      } else {
        console.log('Fetched topic.');
      }
    }
  },
  properties: { topicId: String },
  methods: {
    handleTap() {
      dispatch({ type: 'LOAD_TOPIC', topicId: this.data.topicId });
    },
  },
});
```

## FAQ

### Q: Page() 不支持 behaviors 机制，我该如何把数据绑定到页面上呢？

A: 页面除了能通过 Page() 创建，还可以通过 Component() 创建的，详情可参考[官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html)。页面通过 Component() 创建，就可以使用 selector 绑定数据了。

### Q: 为什么该组件需要依赖 2.2.3 版的基础库？

A: 因为该组件依赖到自定义组件里的生命周期，详情可参考[官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/lifetimes.html)。

## License

MIT
