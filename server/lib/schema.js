import {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLList,
} from 'graphql';

import {Region} from './types/basic';
import {Collection} from './types/collections';
import {Video, Concept} from './types/content';

import sources from '../config/sources';

const queryType = new GraphQLObjectType({
	name: 'Query',
	description: 'FT content API',
	fields: {
		top: {
			type: Collection,
			args: {
				region: { type: new GraphQLNonNull(Region) }
			},
			resolve: (root, {region}, {rootValue: {backend}}) => {
				let uuid = sources[`${region}Top`].uuid;

				return backend.page(uuid);
			}
		},
		fastFT: {
			type: Collection,
			resolve: (root, _, {rootValue: {backend}}) => {
				return backend.fastFT();
			}
		},
		editorsPicks: {
			type: Collection,
			resolve: (root, _, {rootValue: {backend, flags}}) => {
				if (flags && flags.editorsPicksFromList) {
					return backend.list(sources['editorsPicks'].uuid);
				} else {
					return [];
				}
			}
		},
		opinion: {
			type: Collection,
			resolve: (root, _, {rootValue: {backend}}) => {
				let {uuid, sectionsId} = sources.opinion;

				return backend.page(uuid, sectionsId);
			}
		},
		lifestyle: {
			type: Collection,
			resolve: (root, _, {rootValue: {backend}}) => {
				let {uuid, sectionsId} = sources.lifestyle;

				return backend.page(uuid, sectionsId);
			}
		},
		markets: {
			type: Collection,
			resolve: (root, _, {rootValue: {backend}}) => {
				let {uuid, sectionsId} = sources.markets;

				return backend.page(uuid, sectionsId);
			}
		},
		technology: {
			type: Collection,
			resolve: (root, _, {rootValue: {backend}}) => {
				let {uuid, sectionsId} = sources.technology;

				return backend.page(uuid, sectionsId);
			}
		},
		popular: {
			type: Collection,
			resolve: (root, _, {rootValue: {backend}}) => {
				let url = sources.popular.url;

				return backend.popular(url, 'Popular');
			}
		},
		search: {
			type: Collection,
			args: {
				query: { type: new GraphQLNonNull(GraphQLString) }
			},
			resolve: (_, {query}, {rootValue: {backend}}) => {
				return backend.search(query)
					.then(ids => ({ items: ids }));
			}
		},
		videos: {
			type: new GraphQLList(Video),
			resolve: (root, _, {rootValue: {backend}}) => {
				let {id} = sources.videos;
				return backend.videos(id);
			}
		},
		popularTopics: {
			type: new GraphQLList(Concept),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt },
			},
			resolve: (root, {from, limit}, {rootValue: {backend}}) => {
				return backend.popularTopics({from, limit})
			}
		}
	}
});

export default new GraphQLSchema({
	query: queryType
});
