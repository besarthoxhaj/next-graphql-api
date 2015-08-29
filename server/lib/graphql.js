import { graphql } from 'graphql';
import { printSchema } from 'graphql/utilities';

import schema from './schema';
import backend from './backend';

const query = (backend) => {
	return (queryText) => {
		return graphql(schema, queryText, {
			backend: backend
		})
		.then(it => {
			if(it.data) { return it.data; }

			throw it.errors;
		});
	};
};

const fetchEs = query(backend(true));
const fetchCapi = query(backend(false));

// FIXME figure out a more globally applicable mocking strategy
// const fetchMock = fetch(backend(true, true));

export default (elastic) => ({
	schema: schema,
	printSchema: () => printSchema(schema),
	query: (elastic ? fetchEs : fetchCapi)
});
