import logger from '@financial-times/n-logger';
import httpStatus from 'http-status-codes';
import { GraphQLError } from 'graphql/error'

import graphql from '../lib/graphql';
import { HttpError } from '../lib/errors';

export default (req, res) => {
	const flags = res.locals.flags;
	const query = req.body.query || req.query.query || req.body;
	const vars = JSON.parse(req.body.variables || '{}');

	if (!Object.keys(query).length) {
		const message = 'Empty query supplied';
		logger.warn(message);
		return res.status(400).jsonp({ type: 'Bad Request', error: { message }});
	}

	graphql({ flags, req })
		.fetch(query, vars)
		.then(data => res.jsonp(data))
		.catch(errs => {
			const err = Array.isArray(errs) ? errs.shift() : errs;
			const error = err instanceof GraphQLError && err.originalError ? err.originalError : err;
			const status = error instanceof HttpError ? error.status : 500;

			return res.status(status).jsonp({
				type: httpStatus.getStatusText(status),
				error: { message: error.message }
			});
		});
};
