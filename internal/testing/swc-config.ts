const config = {
  jsc: {
    parser: {
      syntax: "typescript",
    },
    transform: {
      react: {
        runtime: "automatic",
      },
    },
  },
  module: {
    type: "commonjs",
  },
  sourceMaps: true,
};

export default config;
