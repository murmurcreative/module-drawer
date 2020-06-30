const path = require('path');

// if you need to support IE11 use `createCompatibilityConfig` instead.
const { createCompatibilityConfig } = require('@open-wc/building-webpack');

module.exports = createCompatibilityConfig({
  input: path.resolve(__dirname, './demo/index.html'),
});
