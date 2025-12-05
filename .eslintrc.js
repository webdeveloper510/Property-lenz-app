module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
	'prettier/prettier': 0,
	'no-unused-vars': 'off',
	'@typescript-eslint/no-unused-vars': 'off',
	'eqeqeq': 'off',
	'react-hooks/exhaustive-deps': 'off',
	'react/prop-types': 'off',
	'react-native/no-inline-styles': 'off',
  },
};
