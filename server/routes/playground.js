export default (req, res) => {
	res.render('playground', {
		layout: 'techdocs',
		// NOTE: ok to output this as playground route is behind sso
		apiKey: process.env.GRAPHQL_API_KEY
	});
};
