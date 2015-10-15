import {graphql} from 'graphql';
import {printSchema} from 'graphql/utilities';

import schema from './schema';
import {factory as backend} from './backend';
import { logger } from 'ft-next-express';

const fetch = (backend, flags = {}) => {
	return (query, vars) => {
		const then = new Date().getTime();

		return graphql(schema, query, { backend, flags }, vars)
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

export default (opts = {}, flags = {}) => ({
	fetch: fetch(backend(opts), flags),
	printSchema: () => printSchema(schema)
});
