import {graphql} from 'graphql';
import {printSchema} from 'graphql/utilities';

import schema from './schema';
import {factory as backend} from './backend';
import { logger } from 'ft-next-express';

const fetch = (backend, opts = {}) => {
	return (query, vars) => {
		const then = new Date().getTime();

		return graphql(schema, query, Object.assign({}, opts, { backend: backend }), vars)
			.then(it => {
				const now = new Date().getTime();

				logger.info(`Graphql (${backend.type}) responded in ${now - then} ms`);

				if (it.errors) {
					throw it.errors;
				}

				if(it.data) { return it.data; }
			});
	};
};

export default (elastic, mock, opts = {}) => {
	const fetchEs = fetch(backend(true), opts);
	const fetchCapi = fetch(backend(false), opts);

	const fetchMock = fetch(backend(true, true), opts);

	return {
		fetch: (mock ? fetchMock : (elastic ? fetchEs : fetchCapi)),
		printSchema: () => printSchema(schema)
	}
};
