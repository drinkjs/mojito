const path = require('path');
const webpack = require('webpack');
const CracoLessPlugin = require('craco-less');

const isDevelop = process.env.IS_USE_LOCAL === 'true';

module.exports = {
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    return {
      ...devServerConfig,
      proxy: {
        '/api': {
          target: isDevelop ? 'http://127.0.0.1:3838' : 'http://mojito.drinkjs.com',
          pathRewrite: isDevelop ? { '^/api': '' } : {},
          changeOrigin: true
        },
        '/public': {
          target: isDevelop ? 'http://127.0.0.1:3838' : 'http://mojito.drinkjs.com',
          changeOrigin: true
        },
        '/ws': {
          target: isDevelop ? 'ws://127.0.0.1:3838' : 'ws://mojito.drinkjs.com',
          ws: true,
          changeOrigin: true
        }
      }
    };
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@ant-prefix': 'mojito'
              // '@iconfont-css-prefix': 'mojitoicon'
            },
            javascriptEnabled: true
          }
        }
      }
    }
  ],
  webpack: {
    alias: {},
    plugins: {
      add: [
        new webpack.DefinePlugin({
          REACT_APP_LIB_URI: JSON.stringify(process.env.REACT_APP_LIB_URI)
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
          'react-dom': 'ReactDOM'
        }
      };
    }
  }
};
