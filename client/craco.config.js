const path = require('path');
const webpack = require('webpack');
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const indexHtml =
  process.env.NODE_ENV === 'development' ? 'index.dev.html' : 'index.html';

const ROOT_PATH = path.resolve(process.cwd());
const ENTRY_PATH = `${ROOT_PATH}/public`;

module.exports = {
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    return {
      ...devServerConfig,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3838',
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/api': '' },
        },
        '/public': {
          target: 'http://127.0.0.1:3838',
        },
        '/ws': {
          target: 'ws://127.0.0.1:3838',
          ws: true,
        },
      },
    };
  },
  webpack: {
    alias: {},
    plugins: {
      add: [
        // new HtmlWebpackPlugin({
        //   title: "Mojito | 大屏可视化编辑器",
        //   filename: "index.html",
        //   template: `${ENTRY_PATH}/${indexHtml}`,
        //   hash: false
        // }),
        new MonacoWebpackPlugin({
          languages: ['javascript', 'css', 'typescript', 'json'],
        }),
        new webpack.DefinePlugin({
          REACT_APP_LIB_URI: JSON.stringify(process.env.REACT_APP_LIB_URI),
        }),
        new webpack.ProgressPlugin(),
      ],
      remove: [] /* An array of plugin constructor's names (i.e. "StyleLintPlugin", "ESLintWebpackPlugin" ) */,
    },
    configure: (webpackConfig, { env, paths }) => {
      /* Any webpack configuration options: https://webpack.js.org/configuration */
      webpackConfig.module.rules.push({
        test: /(.routes.js)/,
        use: {
          loader: path.resolve(__dirname, './router-loader.js'),
        },
      });
      return {
        ...webpackConfig,
        externals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
        },
      };
    },
  },
};
