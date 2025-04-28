const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["dapi.kakao.com"],
  },
  webpack: (config, { isServer }) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, "node_modules/cesium/Build/Cesium"),
            to: "cesium",
          },
        ],
      }),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      })
    );

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        zlib: require.resolve("browserify-zlib"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        url: require.resolve("url"),
        util: require.resolve("util"),
        assert: require.resolve("assert"),
        stream: require.resolve("stream-browserify"),
      };
    }

    return config;
  },
  trailingSlash: true,
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
