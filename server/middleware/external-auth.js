const logger = require('ft-next-express').logger;

export default (req, res, next) => {
	const sessionToken = req.cookies.FTSession;

	const apiKey = req.headers['x-api-key'] || req.query.apiKey;
	if (apiKey) {
		if(apiKey === process.env.GRAPHQL_API_KEY) {
			return next();
		} else {
			logger.error('Bad or missing apiKey');
			return res.status(401).send('Bad or missing apiKey');
		}
	}

	let authPromise;

	res.locals.isUserRequest = true;

	if (sessionToken) {
		const headers = req.headers;

		delete headers.host;
		delete headers['content-length']; //API urls send this and it breaks session fetch

		authPromise = fetch('https://session-next.ft.com/uuid', {
			timeout: 2000,
			headers: headers
		})
		.then(response => response.json())
		.then(response => {

			if(response.uuid) {
				res.locals.uuid = response.uuid;
			}

			return next();
		})
		.catch(err => {
			if (typeof err !== 'number') {
				logger.error('event=failed_session_auth url=%s', req.path);
			}
			throw err;
		});
	}	else {
		authPromise = Promise.reject(401);
	}

	authPromise.catch(() => {
		res.locals.uuid = undefined;
		next();
	});

};
