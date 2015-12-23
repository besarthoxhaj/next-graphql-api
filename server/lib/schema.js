import {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLList,
} from 'graphql';

import { Region } from './types/basic';
import { Collection } from './types/collections';
import { Content, Video, Concept } from './types/content';
import { ContentType } from './types/basic';
import User from './types/user';

import sources from '../config/sources';
import backend from './backend-adapters/index';

const queryType = new GraphQLObjectType({
	name: 'Query',
	description: 'FT content API',
	fields: {
		top: {
			type: Collection,
			args: {
				region: { type: new GraphQLNonNull(Region) }
			},
			resolve: (root, {region}, {rootValue: {flags}}) => {
				let uuid = sources[`${region}Top`].uuid;
				return backend(flags).capi.page(uuid);
			}
		},
		fastFT: {
			type: Collection,
			resolve: (root, _, {rootValue: {flags}}) => {
				return backend(flags).fastFT.fetch();
			}
		},
		editorsPicks: {
			type: Collection,
			resolve: (root, _, {rootValue: {flags}}) => {
				if (flags && flags.editorsPicksFromList) {
					return backend(flags).capi.list(sources['editorsPicks'].uuid);
				} else {
					return [];
				}
			}
		},
		opinion: {
			type: Collection,
			resolve: (root, _, {rootValue: {flags}}) => {
				let {uuid, sectionsId} = sources.opinion;

				return backend(flags).capi.page(uuid, sectionsId);
			}
		},
		lifestyle: {
			type: Collection,
			resolve: (root, _, {rootValue: {flags}}) => {
				let {uuid, sectionsId} = sources.lifestyle;

				return backend(flags).capi.page(uuid, sectionsId);
			}
		},
		markets: {
			type: Collection,
			resolve: (root, _, {rootValue: {flags}}) => {
				let {uuid, sectionsId} = sources.markets;

				return backend(flags).capi.page(uuid, sectionsId);
			}
		},
		technology: {
			type: Collection,
			resolve: (root, _, {rootValue: {flags}}) => {
				let {uuid, sectionsId} = sources.technology;

				return backend(flags).capi.page(uuid, sectionsId);
			}
		},
		popular: {
			type: Collection,
			resolve: (root, _, {rootValue: {flags}}) => {
				let url = sources.popular.url;

				return backend(flags).popular.fetch(url, 'Popular');
			}
		},
		search: {
			type: Collection,
			args: {
				query: { type: new GraphQLNonNull(GraphQLString) }
			},
			resolve: (_, {query}, {rootValue: {flags}}) => {
				return backend(flags).capi.search(query)
					.then(ids => ({ items: ids }));
			}
		},
		videos: {
			type: new GraphQLList(Video),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt }
			},
			resolve: (root, {from, limit}, {rootValue: {flags}}) => {
				let {id} = sources.videos;
				return backend(flags).video.fetch(id, {from, limit});
			}
		},
		popularTopics: {
			type: new GraphQLList(Concept),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt }
			},
			resolve: (root, {from, limit}, {rootValue: {flags}}) => {
				return backend(flags).popularApi.topics({from, limit})
			}
		},
		popularArticles: {
			type: new GraphQLList(Content),
			args: {
				from: {
					type: GraphQLInt
				},
				limit: {
					type: GraphQLInt
				},
				genres: {
					type: new GraphQLList(GraphQLString)
				},
				type: {
					type: ContentType
				}
			},
			resolve: (root, args, { rootValue: { flags }}) => {
				const be = backend(flags);
				return be.popularApi.articles(args)
					.then(articles => be.capi.content(articles, args));
			}
		},
		popularFromHui: {
			type: new GraphQLList(Content),
			args: {
				industry: {
					type: GraphQLString
				},
				position: {
					type: GraphQLString
				},
				sector: {
					type: GraphQLString
				},
				country: {
					type: GraphQLString
				},
				from: {
					type: GraphQLInt
				},
				limit: {
					type: GraphQLInt
				},
				genres: {
					type: new GraphQLList(GraphQLString)
				},
				type: {
					type: ContentType
				}
			},
			resolve: (root, args, { rootValue: { flags }}) => {
				const be = backend(flags);
				return be.hui.content(args)
					.then(articles => be.capi.content(articles, args));
			}
		},
		user: {
			type: User,
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: (root, args) => {
				return { uuid: args.uuid };
			}
		}
	}
});

export default new GraphQLSchema({
	query: queryType
});
