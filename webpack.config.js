const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          compress: {
            // drop_console: true, // Removes console logs
            // drop_debugger: true, // Removes debugger statements
          },
        },
      }),
    ],
    splitChunks: {
      chunks: "all", // Splits vendor libraries and shared chunks
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/, // Split node_modules packages
          name(module) {
            // Create separate chunk names based on package names
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace("@", "")}`;
          },
          chunks: "all",
          priority: -10,
        },
      },
    },
    usedExports: true, // Tree-shaking to remove unused code
  },
  entry: {
    app: "./src/index.tsx", // Your main entry point
    background: "./public/background.js", // Background script
    content: "./public/content.js", // Content script
  },
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === "background" ||
        pathData.chunk.name === "content"
        ? "[name].js" // Disable hash for background.js and content.js
        : "[name].[contenthash].js"; // Enable hash for other files
    },
    path: path.resolve(__dirname, "dist"),
    clean: true,
    chunkFilename: "[name].[contenthash].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/, // Add this rule for SCSS files
        use: ["style-loader", "css-loader", "sass-loader"], // Process SCSS files with these loaders
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/manifest.json", to: "." },
        // { from: "public/index.html", to: "." },
      ],
    }),
    new CompressionPlugin({
      algorithm: "gzip",
      test: /\.js(\?.*)?$/i,
      threshold: 10240, // Only compress files over 10KB
      minRatio: 0.8,
    }),
    new HtmlWebpackPlugin({
      template: "public/index.html", // Template file to generate HTML from
      filename: "index.html", // Output filename
    }),
    // new BundleAnalyzerPlugin(),
  ],
  mode: "production",
};
