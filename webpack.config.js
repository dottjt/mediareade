const webpack = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: {
    'index': './src/index.ts',
    'index.min': './src/index.ts'
  },
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'MyLib',
    umdNamedDefine: true
  },
  externals: {
		canvas: "commonjs canvas" // Important (2)
	},
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({ configFile: "./tsconfig.json" }),
      // new webpack.DefinePlugin({
      //   'process.env.FLUENTFFMPEG_COV': false
      // })
    ],
    // alias: {
    //   data: srcPath('data'),
    //   types: srcPath('../types'),
    // },
  },
  // devtool: 'source-map',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
        query: {
          declaration: false,
        }
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ]
  }
};

// function srcPath(subdir) { return path.join(__dirname, "src", subdir);}

// module.exports = {
//   entry: './src/index.ts',
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         use: 'ts-loader',
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   resolve: {
//     extensions: [ '.tsx', '.ts', '.js' ],
//   },
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'dist'),
//   },
// };


// resolve: {
//   extensions: ['.ts', '.js'],
//   plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
//   // alias: {
//   //   data: srcPath('data'),
//   //   types: srcPath('../types'),
//   // },
// },
