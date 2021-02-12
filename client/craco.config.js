const path = require('path');
const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    return {
      ...devServerConfig,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3838',
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/api': '' }
        },
        '/public': {
          target: 'http://127.0.0.1:3838'
        },
        '/ws': {
          target: 'ws://127.0.0.1:3838',
          ws: true
        }
      }
    };
  },
  webpack: {
    alias: {},
    plugins: {
      add: [
        new MonacoWebpackPlugin({
          languages: ['javascript', 'css', 'typescript', 'json']
        }),
        new webpack.DefinePlugin({
          LIB_URI: JSON.stringify(process.env.LIB_URI)
        }),
        new webpack.ProgressPlugin()
      ],
      remove: [] /* An array of plugin constructor's names (i.e. "StyleLintPlugin", "ESLintWebpackPlugin" ) */
    },
    configure: (webpackConfig, { env, paths }) => {
      /* Any webpack configuration options: https://webpack.js.org/configuration */
      webpackConfig.module.rules.push({
        test: /(.routes.js)/,
        use: {
          loader: path.resolve(__dirname, './router-loader.js')
        }
      });
      return {
        ...webpackConfig,
        externals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd'
        }
      };
    }
  }
};
