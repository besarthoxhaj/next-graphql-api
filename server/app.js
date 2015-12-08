require('babel-register')({
    plugins: [
        'add-module-exports',
        'transform-es2015-destructuring',
        'transform-es2015-modules-commonjs',
        'transform-es2015-parameters'
    ]
});
require('./init');
