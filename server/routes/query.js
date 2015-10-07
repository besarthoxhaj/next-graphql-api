import graphql from '../lib/graphql';

export default (req, res) => {
	const useElasticSearch = res.locals.flags.elasticSearchItemGet.isSwitchedOn;

	const query = req.body.query || req.body;
	const vars = JSON.parse(req.body.variables || '{}');

	graphql(useElasticSearch).query(query, vars)
	.then(data => {
		res.json(data);
	})
	.catch(errors => {
		res.status(400);
		res.json(errors);
	});
};
