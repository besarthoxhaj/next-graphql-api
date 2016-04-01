require('babel-register')({
	plugins: [
		require.resolve('babel-plugin-add-module-exports'),
		require.resolve('babel-plugin-array-includes'),
		require.resolve('babel-plugin-transform-es2015-destructuring'),
		require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
		require.resolve('babel-plugin-transform-es2015-parameters'),
		require.resolve('babel-plugin-transform-es2015-spread')
	]
});
