const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, "src", "index.js"),
    output: {
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "public", "index.html"),
      }),
    ],
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react']
              }
            }
          },
          {
            test: /\.(s(a|c)ss)$/,
            exclude: /\.module\.(s(a|c)ss)$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
          },
          {
            test: /\.module\.scss$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  modules: {
                    localIdentName: '[name]__[local]___[hash:base64:5]',
                    namedExport: false,
                  },
                  sourceMap: true,
                },
              },
              'postcss-loader',
              'sass-loader',
            ],
            include: path.resolve(__dirname, 'src'),
          },
          {
            test: /\.svg|png|jpg|jpeg$/,
            use: ['url-loader']
          }
        ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    devServer: {
      port: 8000,
    },
};
