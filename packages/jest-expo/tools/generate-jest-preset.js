#!/usr/bin/env node
/**
 * Generates the Expo jest-preset.json by deriving it from React Native's
 * jest-preset.json. This script uses the copy of RN in react-native-lab.
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function generateJestPreset() {
  // Load the React Native Jest preset
  const rnLabPath = path.resolve(__dirname, '../../../react-native-lab');
  const rnJestPresetPath = path.join(rnLabPath, 'react-native/jest-preset.json');
  const rnJestPreset = require(rnJestPresetPath);

  // Derive the Expo Jest preset from the React Native one
  const expoJestPreset = JSON.parse(JSON.stringify(rnJestPreset));

  if (!expoJestPreset.moduleNameMapper) {
    expoJestPreset.moduleNameMapper = {};
  }

  if (!expoJestPreset.transform) {
    expoJestPreset.transform = {};
  }

  const defaultAssetNamePattern = '^[./a-zA-Z0-9$_-]+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$';
  assert(expoJestPreset.transform.hasOwnProperty(defaultAssetNamePattern));
  delete expoJestPreset.transform[defaultAssetNamePattern];

  const assetNamePattern =
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp|ttf|otf|m4v|mov|mp4|mpeg|mpg|webm|aac|aiff|caf|m4a|mp3|wav|html|pdf|obj)$';
  expoJestPreset.transform[assetNamePattern] = 'jest-expo/src/assetFileTransformer.js';

  assert(Array.isArray(expoJestPreset.transformIgnorePatterns));
  assert.deepEqual(expoJestPreset.transformIgnorePatterns, [
    'node_modules/(?!(jest-)?react-native|react-clone-referenced-element)',
  ]);
  expoJestPreset.transformIgnorePatterns = [
    'node_modules/(?!((jest-)?react-native|react-clone-referenced-element|expo(nent)?|@expo(nent)?/.*|react-navigation|sentry-expo))',
  ];

  if (!expoJestPreset.setupFiles) {
    expoJestPreset.setupFiles = [];
  } else {
    expoJestPreset.setupFiles = expoJestPreset.setupFiles.map(setupFile =>
      setupFile.replace(/^<rootDir>\/node_modules\//, '')
    );
  }
  expoJestPreset.setupFiles.push('jest-expo/src/setup.js');

  // Save the Expo Jest preset
  fs.writeFileSync(
    path.resolve(__dirname, '../jest-preset.json'),
    JSON.stringify(expoJestPreset, null, 2)
  );
}

if (require.main === module) {
  generateJestPreset();
}
