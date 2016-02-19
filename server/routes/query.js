import graphql from '../lib/graphql';
import logger from '@financial-times/n-logger';
import httpStatus from 'http-status-codes';

export default (req, res, next) => {


	const flags = res.locals.flags;
	const query = req.body.query || req.query.query || req.body;
	const vars = JSON.parse(req.body.variables || '{}');

	if (!Object.keys(query).length) {
		const message = 'Empty query supplied';
		logger.warn(message);
		return res.status(400).jsonp({ type: 'Bad Request', error: { message }});
	}

	graphql(flags, res.locals.isUserRequest, res.locals.uuid)
		.fetch(query, vars)
		.then(data => res.jsonp(data))
		.catch(errs => {
			const err = Array.isArray(errs) ? errs.shift() : errs;
			if (Number.isInteger(parseInt(err.message))) {
				return res.status(err.message).jsonp({
					type: httpStatus.getStatusText(err.message),
					error: { message: err.message }
				});
			}
			next(err);
		});
};
