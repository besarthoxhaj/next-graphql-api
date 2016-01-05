export default (req, res, next) => {

	const apiKey = req.headers['x-api-key'] || req.query.apiKey;
	//Never cache in browser
	res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
	//Cache in fastly if we have an api key (i.e. server side GET requests);
	if(apiKey) {
		res.set('Surrogate-Control', 'max-age=600, public, stale-while-revalidate=3600, stale-if-error=86400');
	}

	next();
}
