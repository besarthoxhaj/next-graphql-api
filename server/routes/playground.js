import graphql from '../lib/graphql';

export default (req, res) => {
	res.render('playground', {
		layout: 'techdocs'
	});
};
