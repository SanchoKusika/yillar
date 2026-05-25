module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "react" }]],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@shared": "./src/shared",
            "@entities": "./src/entities",
            "@features": "./src/features",
            "@theme": "./src/theme",
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
