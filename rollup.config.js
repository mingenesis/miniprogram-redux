const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const { terser } = require('rollup-plugin-terser');
const pkg = require('./package.json');

const babelConfig = {
  babelrc: false,
  exclude: 'node_modules/**',
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['ie >= 11'],
        },
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        loose: true,
        modules: false,
      },
    ],
  ],
  plugins: ['@babel/plugin-proposal-object-rest-spread'],
};

module.exports = [
  // CommonJS
  {
    input: 'src/index.js',
    output: {
      file: 'lib/miniprogram-redux.js',
      format: 'cjs',
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [babel(babelConfig)],
  },

  // ES
  {
    input: 'src/index.js',
    output: {
      file: 'es/miniprogram-redux.js',
      format: 'es',
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [babel(babelConfig)],
  },

  // Miniprogram
  {
    input: 'src/index.js',
    output: {
      file: 'miniprogram_dist/index.js',
      format: 'cjs',
    },
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      babel(babelConfig),
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
];
