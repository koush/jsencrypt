const path = require('path');
var modules_path = path.resolve(__dirname, './bin');
const webpack = require('webpack');


module.exports = {
  target: 'web',
  // devtool: 'inline-source-map',
  entry: './src/index.ts',
  output: {
    libraryTarget: "umd",
    filename: 'jsencrypt.js',
    chunkFilename: 'modules/[chunkhash].[name].chunk.js',
    path: modules_path,
    strictModuleExceptionHandling: true,
    globalObject: 'exports',
  },

  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new webpack.DefinePlugin({
      JSENCRYPT_VERSION: JSON.stringify(require("./package.json").version)
    })
  ],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: false,
              configFile: require.resolve("./tsconfig.json")
            }
          },
        ]
      },
    ]
  },

};