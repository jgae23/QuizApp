module.exports = {
    transformIgnorePatterns: [
      'node_modules/(?!(axios)/)' // This tells Jest to transform axios
    ],
    transform: {
      '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }]
    }
};