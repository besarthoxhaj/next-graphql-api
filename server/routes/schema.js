import graphql from '../lib/graphql';

export default (req, res) => {
	const schema = graphql().printSchema();

	res.render('schema', {
		layout: 'techdocs',
		schema: schema
	});
};
