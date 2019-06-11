const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const packages = path.join(__dirname, '../../packages');
console.log(packages);
let config = {
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      }
    ]
  },
  plugins: [
    new TsconfigPathsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        resolve: {},
        ts: {
          configFile: 'tsconfig.json'
        }
      },
      debug: true
    })
  ],
  devtool: 'source-map',
  output: {
    path: path.join(process.cwd(), '.tmp'),
    filename: 'index.js'
  },
  resolve: {
    extensions: [
      '.webpack.js',
      '.web.js',
      '.js',
      '.ts'
    ],
    alias: {}
  },
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client?quiet=true',
    `./src/index.ts`
  ]
};

let dirs = fs.readdirSync(packages);
for (let pkg of dirs) {
  config.resolve.alias[`@fin/${pkg}`] = path.join(packages, pkg);
}

module.exports = config;
