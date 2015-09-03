var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var plugins = [
	// Global definitions
	new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
		}
	}),
	new ExtractTextPlugin('main.css'),
	new webpack.NoErrorsPlugin()
];

if(process.env.NODE_ENV === 'production') {
	plugins = plugins.concat([
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.optimize.DedupePlugin()
	]);
}

var config = {
	entry: ['./client/main.js', './client/main.css'],
	output: {
		path: path.join(__dirname, 'public'),
		filename: 'main.js'
	},
	module: {
		loaders: [
			{ test: /\.js?$/, loader: 'babel' },
			{ test: /fastclick\.js$/, loader: 'imports?define=>false' }, // force fastclick to load CommonJS!postcss-loader!postcss-loader
			{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }
			// TODO { test: /\.cssm$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]') }
		]
	},
	resolveLoader: {
		fallback:	path.join(__dirname, 'node_modules')
	},
	resolve: {
		root: [],
		moduleDirectories: ['node_modules', 'components']
	},
	plugins: plugins,
	devtool: 'source-map'
};

module.exports = config;
