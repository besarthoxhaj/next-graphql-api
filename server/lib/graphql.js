import { graphql } from 'graphql';
import { printSchema } from 'graphql/utilities';

import schema from './schema';
import {factory as backendFactory} from './backend';

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

const fetchEs = query(backendFactory(true));
const fetchCapi = query(backendFactory(false));

// FIXME figure out a more globally applicable mocking strategy
// const fetchMock = fetch(backend(true, true));

export default (elastic) => ({
	schema: schema,
	printSchema: () => printSchema(schema),
	query: (elastic ? fetchEs : fetchCapi)
});
