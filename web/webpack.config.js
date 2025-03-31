const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname, '../');

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published to npm. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary `node_module`.
const babelLoaderConfiguration = {
  test: /\.js$|tsx?$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    path.resolve(appDirectory, 'index.js'),
    path.resolve(appDirectory, 'App.tsx'),
    path.resolve(appDirectory, 'app'),
    path.resolve(appDirectory, 'components'),
    path.resolve(appDirectory, 'screens'),
    path.resolve(appDirectory, 'utils'),
    path.resolve(appDirectory, 'contexts'),
    path.resolve(appDirectory, 'node_modules/react-native-vector-icons'),
    path.resolve(appDirectory, 'node_modules/react-native-maps'),
    // Add more as needed for your specific project structure
  ],
  exclude: /node_modules\/(?!(react-native-.*|@react-native-.*)\/).*/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // The 'metro-react-native-babel-preset' preset is recommended to match React Native's packager
      presets: ['module:metro-react-native-babel-preset'],
      plugins: ['react-native-web']
    }
  }
};

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    }
  }
};

module.exports = {
  entry: path.resolve(appDirectory, 'web/index.js'),
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(appDirectory, 'web/dist'),
  },
  resolve: {
    extensions: ['.web.js', '.js', '.tsx', '.ts'],
    alias: {
      'react-native$': 'react-native-web',
      // Add any other library aliases as needed
    },
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // See: https://github.com/necolas/react-native-web/issues/349
      __DEV__: JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'web/index.html'),
      filename: 'index.html'
    })
  ]
}; 