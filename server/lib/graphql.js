import {graphql} from 'graphql';
import {printSchema} from 'graphql/utilities';

import schema from './schema';
import { logger } from 'ft-next-express';

const fetch = (flags = {}) => {
	return (query, vars) => {
		const then = new Date().getTime();

		return graphql(schema, query, { flags }, vars)
			.then(it => {
				const now = new Date().getTime();

				logger.info(`Graphql responded in ${now - then} ms`);

				if (it.errors) {
					throw it.errors;
				}

				if(it.data) { return it.data; }
			});
	};
};

export default (flags = {}) => ({
	fetch: fetch(flags),
	printSchema: () => printSchema(schema)
});
