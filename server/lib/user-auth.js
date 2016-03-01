import { HttpError } from './errors';

export default (req, uuid) => {
	const apiKey = (req.headers && req.headers['x-api-key']) || (req.query && req.query.apiKey);
	if (apiKey) {
		if (apiKey === process.env.GRAPHQL_API_KEY) {
			return Promise.resolve(uuid)
		} else {
			return Promise.reject(new HttpError('Bad or missing apiKey', 401));
		}
	}
	if (req.cookies.FTSession) {
		const headers = req.headers;
		delete headers.host;
		delete headers['content-length']; //API urls send this and it breaks session fetch
		return fetch('https://session-next.ft.com/uuid', {
			timeout: 2000,
			headers: headers
		})
			.then(foo => console.log(foo))
			.then(response => response.json())
			.then(response => {
				if (response.uuid && response.uuid === uuid) {
					return uuid;
				} else {
					throw new HttpError('Failed session auth', 401);
				}
			});
	} else {
		return Promise.reject(new HttpError('Not authorised to view user data', 401));
	}
};
