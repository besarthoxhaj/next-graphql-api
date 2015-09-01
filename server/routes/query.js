import graphql from '../lib/graphql';

export default (req, res) => {
	const useElasticSearch = res.locals.flags.elasticSearchItemGet.isSwitchedOn;

	const query = req.body;
	const graph = graphql(useElasticSearch);

	graphql(useElasticSearch).query(query)
	.then(data => {
		res.json(data);
	})
	.catch(errors => {
		res.status(400);
		res.json(errors);
	});
};
