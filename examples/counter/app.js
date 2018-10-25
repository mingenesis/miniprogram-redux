const { reduxApp, Redux } = require('miniprogram-redux');
const counter = require('./reducers/index');

const store = Redux.createStore(counter);

App(reduxApp(store)({}));
