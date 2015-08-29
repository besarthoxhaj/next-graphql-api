import {Promise} from 'es6-promise';
import directly from 'directly';

import {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLList,
} from 'graphql';

import {Region} from './types/basic';
import {Collection, VideoCollection} from './types/collections';
import {Video} from './types/content';

import sources from './config/sources';

const queryType = new GraphQLObjectType({
	name: 'Query',
	description: 'FT content API',
	fields: {
		top: {
			type: Collection,
			args: {
				region: { type: new GraphQLNonNull(Region) }
			},
			resolve: (root, {region}, {backend}) => {
				let uuid = sources[`${region}Top`].uuid;

				return backend.page(uuid);
			}
		},
		fastFT: {
			type: Collection,
			resolve: (root, _, {backend}) => {
				return backend.fastFT();
			}
		},
		editorsPicks: {
			type: Collection,
			resolve: (root, _, {backend}) => {
				// HACK this is waiting for editorial to start managing an Editor's picks list
				let config = ['bigRead', 'lunch', 'management', 'frontPageSkyline', 'personInNews', 'lex'];

				let fetchers = config
				.map((it) => ({
					type: sources[it].type,
					uuid: sources[it].uuid
				}))
				.map((it) => {
					switch(it.type) {
						case 'page':
							return () => {
 								return backend.page(it.uuid)
								.then(page => page.items[0]);
							};
						case 'search':
							return () => {
								return backend.search(it.uuid)
								.then(ids => ids[0]);
							};
						default:
							throw 'Unknown type: ' + it.type;
					}
				});

				return directly(3, fetchers)
				.then(ids => ({
					title: 'Editor\'s picks',
					conceptId: null,
					sectionId: null,
					items: ids
				}));
			}
		},
		opinion: {
			type: Collection,
			resolve: (root, _, {backend}) => {
				let {uuid, sectionsId} = sources.opinion;

				return backend.page(uuid, sectionsId);
			}
		},
		lifestyle: {
			type: Collection,
			resolve: (root, _, {backend}) => {
				let {uuid, sectionsId} = sources.lifestyle;

				return backend.page(uuid, sectionsId);
			}
		},
		markets: {
			type: Collection,
			resolve: (root, _, {backend}) => {
				let {uuid, sectionsId} = sources.markets;

				return backend.page(uuid, sectionsId);
			}
		},
		technology: {
			type: Collection,
			resolve: (root, _, {backend}) => {
				let {uuid, sectionsId} = sources.technology;

				return backend.page(uuid, sectionsId);
			}
		},
		popular: {
			type: Collection,
			resolve: (root, _, {backend}) => {
				let url = sources.popular.url;

				return backend.popular(url, 'Popular');
			}
		},
		search: {
			type: Collection,
			args: {
				query: { type: new GraphQLNonNull(GraphQLString) }
			},
			resolve: (_, {query}, {backend}) => {
				return backend.search(query)
					.then(ids => ({ items: ids }));
			}
    },
    videos: {
      type: new GraphQLList(Video),
      resolve: (root, _, {backend}) => {
        let {id} = sources.videos;

        return backend.videos(id);
      }
    }
  }
});

export default new GraphQLSchema({
	query: queryType
});
