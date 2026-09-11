module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@models': './src/models',
            '@services': './src/services',
            '@utils': './src/utils',
            '@theme': './src/theme',
            '@context': './src/context',
            '@navigation': './src/navigation',
            '@screens': './src/screens',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
