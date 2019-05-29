const config = {
  compilationOptions: {
    preferredConfigPath: './tsconfig.json',
  },

  entries: [
    {
      filePath: './lib/index.d.ts',
      outFile: './lib/index.d.ts',
      noCheck: false,
    }
  ],
};

module.exports = config;
