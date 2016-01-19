export default (req, res, next) => {

	const origin = req.headers.origin;

	if(origin) {
		res.header('Access-Control-Allow-Origin', origin);
		res.header('Access-Control-Allow-Credentials', true);
		res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
		res.vary('Origin');
	}
	next();
};
