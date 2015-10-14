import graphql from '../lib/graphql';
import { logger } from 'ft-next-express';

export default (req, res, next) => {
	const flags = res.locals.flags;

	const query = req.body.query || req.body;
	const vars = JSON.parse(req.body.variables || '{}');

	if (!Object.keys(query).length) {
		logger.warn('Empty query supplied');
		return res.status(400).send();
	}

	graphql({
			elasticSearch: flags.elasticSearchItemGet,
			elasticSearchAws: flags.elasticSearchOnAws,
			mock: flags.mockFrontPage
		})
		.fetch(query, vars)
		.then(data => {
			res.json(data);
		})
		.catch(errs => {
			const err = Array.isArray(errs) ? errs.shift() : errs;
			next(err);
		});
};
