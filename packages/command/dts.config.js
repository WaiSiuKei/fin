const config = {
  compilationOptions: {
    preferredConfigPath: './tsconfig.json',
  },

  entries: [
    {
      filePath: './src/index.ts',
      outFile: './out/index.d.ts',
      noCheck: false,
    }
  ],
};

module.exports = config;
