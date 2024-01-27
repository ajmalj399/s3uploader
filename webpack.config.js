const webpack = require("webpack");

module.exports = {
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
    },
  },
};
const webpack = require("webpack");

module.exports = {
  resolve: {
    fallback: {
      os: require.resolve("os-browserify/browser"),
    },
  },
};
