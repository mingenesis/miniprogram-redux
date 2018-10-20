const { NODE_ENV, BABEL_ENV } = process.env;

const cjs = BABEL_ENV === 'cjs' || NODE_ENV === 'test';

module.exports = {
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
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    cjs && '@babel/plugin-transform-modules-commonjs',
  ].filter(Boolean),
};
