const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const OUTPUT_DIR = resolve(__dirname, 'dist');

module.exports = {
  entry: './src/App.tsx',
  mode: 'development',
  output: {
    filename: 'app.js',
    path: OUTPUT_DIR,
  },
  devServer: {
    contentBase: resolve(__dirname, 'assets'),
    contentBasePublicPath: '/static',
    compress: true,
    hot: true,
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [
          /node_modules/,
          /scraps/,
        ],
        use: ['ts-loader', 'eslint-loader'],
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          'css-modules-typescript-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]--[hash:base64:5]'
              }
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(frag|vert|glsl)$/,
        use: [
          {
            loader: 'glsl-shader-loader',
          }
        ]
      },
      {
        test: /\.(png|svg|jpe?g|gif|mp3|wav)$/,
        use: ['file-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      components: resolve(__dirname, 'src/components/'),
      utils: resolve(__dirname, 'src/utils/'),
      assets: resolve(__dirname, 'assets/'),
    },
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'src', 'index.html'),
      filename: 'index.html'
    }),
  ],
};
