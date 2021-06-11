const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/i,
  use: ["style-loader", "css-loader", "postcss-loader"],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      fs: require.resolve("brfs"),
      path: require.resolve("path-browserify"),
      stream: require.resolve("stream-browserify")
    }
  },
};
