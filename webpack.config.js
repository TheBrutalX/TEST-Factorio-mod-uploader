// webpack.config.js
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  target: 'node', // Ensure the output is compatible with Node.js
  entry: './src/index.ts', // Your main TypeScript file
  output: {
    filename: 'bundle.js', // Output a single file
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve both .ts and .js files
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.json') // Ensure this points to your tsconfig.json
      })
    ] // Resolve paths using tsconfig.json
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules|__tests__/,
      },
    ],
  },
  mode: 'production', // Minification for production
  optimization: {
    minimize: true, // Optional: Set to true for minifying the output file
  },
};