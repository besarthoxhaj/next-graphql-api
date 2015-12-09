import graphql from '../lib/graphql';
import { logger } from 'ft-next-express';

export default (req, res, next) => {
	const apiKey = req.headers['x-api-key'] || req.query.apiKey;
	if (!apiKey || apiKey !== process.env.GRAPHQL_API_KEY) {
		logger.error('Bad or missing apiKey');
		return res.status(401).send('Bad or missing apiKey');
	}

	const flags = res.locals.flags;
	const query = req.body.query || req.query.query || req.body;
	const vars = JSON.parse(req.body.variables || '{}');

	if (!Object.keys(query).length) {
		logger.warn('Empty query supplied');
		return res.status(400).send();
	}

	graphql(
		{
			mock: flags.mockFrontPage
		},
		flags
	)
		.fetch(query, vars)
		.then(data => {
			if(req.method === 'GET') {
				res.set({'Surrogate-Control': 'max-age=120,stale-while-revalidate=6,stale-if-error=259200'});
			}
			res.json(data);
		})
		.catch(errs => {
			const err = Array.isArray(errs) ? errs.shift() : errs;
			next(err);
		});
};
