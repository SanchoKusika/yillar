const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// SVG-as-React-component support via react-native-svg-transformer.
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  // Force Metro to use CJS (main field) instead of ESM exports.
  // @supabase/supabase-js ESM uses import(OTEL_PKG) — a variable dynamic import
  // that Hermes cannot compile.
  unstable_enablePackageExports: false,
};

module.exports = config;
