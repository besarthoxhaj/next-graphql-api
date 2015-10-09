import graphql from '../lib/graphql';
import { logger } from 'ft-next-express';

export default (req, res) => {
	const flags = res.locals.flags;
	const useElasticSearch = flags.elasticSearchItemGet;
	const useMockBackend = flags.mockFrontPage;

	const query = req.body.query || req.body;
	const vars = JSON.parse(req.body.variables || '{}');

	graphql(useElasticSearch, useMockBackend, { flags })
		.fetch(query, vars)
		.then(data => {
			res.json(data);
		})
		.catch(err => {
			logger.error('Error querying data', err);
			res.status(400);
			res.json(err);
		});
};
