const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Dotenv = require("dotenv-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = [
    new ForkTsCheckerWebpackPlugin({
      async: false
    }),
    new Dotenv(),
    new CopyWebpackPlugin({
        patterns: [{
            from: path.resolve(__dirname, "src/static"),
            to: path.resolve(__dirname, ".webpack/renderer/static")
        }]
    })
];
