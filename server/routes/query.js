import graphql from '../lib/graphql';
import logger from '@financial-times/n-logger';

export default (req, res, next) => {


	const flags = res.locals.flags;
	const query = req.body.query || req.query.query || req.body;
	const vars = JSON.parse(req.body.variables || '{}');

	if (!Object.keys(query).length) {
		logger.warn('Empty query supplied');
		return res.status(400).send();
	}

	graphql(flags, res.locals.isUserRequest, res.locals.uuid)
		.fetch(query, vars)
		.then(data => res.jsonp(data))
		.catch(errs => {
			const err = Array.isArray(errs) ? errs.shift() : errs;
			if(Number.isInteger(parseInt(err.message))) {
				return res.send(parseInt(err.message));
			}
			next(err);
		});
};
