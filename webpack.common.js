const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const path = require('path')
const handlebars = require('handlebars')

function loadStrings(languageCode) {
  const stringsFile = path.resolve(__dirname, 'src', 'translations', `${languageCode}.yml`)
  const strings = yaml.safeLoad(fs.readFileSync(stringsFile, 'utf8'))
  return formatStrings(strings)
}

function HandlebarsPlugin(options) {
  options = options || {};
  this.template = options.template;
}

HandlebarsPlugin.prototype.apply = function(compiler) {
  compiler.hooks.compilation.tap('HandlebarsPlugin', function (compilation) {
    compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('HandlebarsPlugin', function (data, callback) {
      const template = handlebars.compile(data.html)
      const strings = loadStrings(data.plugin.options.language)
      data.html = template(strings)
      callback(null, data)
    });
  });
}


module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'app.[hash].js',
    path: path.resolve(__dirname, './dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
      }, {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader'
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ]
      }, {
        test: /\.(woff(2)?|ttf|eot|svg|otf)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HandlebarsPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      inlineSource: '.(js|css)$',
      language: 'en'
    }),
    new CopyPlugin([
      { from: 'static', to: '' }
    ]),
    new MiniCssExtractPlugin({
      filename: 'app.[hash].css',
      chunkFilename: '[id].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    })
  ]
};
