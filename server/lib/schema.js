import {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLList
} from 'graphql';

import { Region } from './types/basic';
import { Page, List, ContentByConcept } from './types/collections';
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
			type: Page,
			args: {
				region: { type: new GraphQLNonNull(Region) }
			},
			resolve: (root, {region}, {rootValue: {flags}}) => {
				const uuid = sources[`${region}Top`].uuid;
				return backend(flags).capi.page(uuid);
			}
		},
		topStoriesList: {
			type: List,
			args: {
				region: { type: new GraphQLNonNull(Region) }
			},
			resolve: (root, {region}, {rootValue: {flags}}) => {
				let uuid = sources[`${region}TopList`].uuid;
				return backend(flags).capi.list(uuid);
			}
		},
		fastFT: {
			type: ContentByConcept,
			resolve: (root, _, {rootValue: {flags}}) => {
				return backend(flags).fastFT.fetch();
			}
		},
		editorsPicks: {
			type: List,
			resolve: (root, _, {rootValue: {flags}}) => {
				if (flags && flags.editorsPicksFromList) {
					return backend(flags).capi.list(sources['editorsPicks'].uuid);
				} else {
					return [];
				}
			}
		},
		opinion: {
			type: Page,
			resolve: (root, _, {rootValue: {flags}}) => {
				let {uuid, sectionsId} = sources.opinion;

				return backend(flags).capi.page(uuid, sectionsId);
			}
		},
		lifestyle: {
			type: Page,
			resolve: (root, _, {rootValue: {flags}}) => {
				let {uuid, sectionsId} = sources.lifestyle;

				return backend(flags).capi.page(uuid, sectionsId);
			}
		},
		markets: {
			type: Page,
			resolve: (root, _, {rootValue: {flags}}) => {
				let {uuid, sectionsId} = sources.markets;

				return backend(flags).capi.page(uuid, sectionsId);
			}
		},
		technology: {
			type: Page,
			resolve: (root, _, {rootValue: {flags}}) => {
				let {uuid, sectionsId} = sources.technology;

				return backend(flags).capi.page(uuid, sectionsId);
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
		todaysTopics: {
			type: new GraphQLList(Concept),
			args: {
				region: { type: new GraphQLNonNull(Region) },
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt },
				genres: { type: new GraphQLList(GraphQLString) },
				type: { type: ContentType }
			},
			resolve: (root, {region, from, limit, genres, type}, {rootValue: {flags}}) => {
				return backend(flags)
						.todaysTopics
						.getTopics({region, from, limit, genres, type}, flags)
						.then(topics => topics.slice(0, limit));
			}
		},
		popularTopics: {
			type: new GraphQLList(Concept),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt }
			},
			resolve: (root, {from, limit}, {rootValue: {flags}}) => {
				return backend(flags).popularApi.topics({from, limit});
			}
		},
		popularReadTopicsFromMyFtApi: {
			type: new GraphQLList(Concept),
			args: {
				limit: { type: GraphQLInt }
			},
			resolve: (root, {limit}, {rootValue: {flags}}) => {
				return backend(flags).myft.getMostReadTopics({limit})
						.then(items => backend(flags).capi.things(items.map(t => t.uuid)).then(c => c.items));
			}
		},
		popularFollowedTopicsFromMyFtApi: {
			type: new GraphQLList(Concept),
			args: {
				limit: { type: GraphQLInt }
			},
			resolve: (root, {limit}, {rootValue: {flags}}) => {
				return backend(flags).myft.getMostFollowedTopics({limit})
						.then(items => backend(flags).capi.things(items.map(t => t.uuid)).then(c => c.items));
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
				period: {
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
		popularTopicsFromHui: {
			type: new GraphQLList(Concept),
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
				period: {
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
			resolve: (root, { industry, position, sector, country, period, from, limit, genres, type}, {rootValue: {flags}}) => {
				return backend(flags)
						.hui.topics({industry, position, sector, country, period})
						.then(items => {
							return backend(flags).capi
									.things(items, 'prefLabel')
									.then(c => c.items
												.filter(t => t)
												.slice(0, limit));
						});
			}
		},
		user: {
			type: User,
			args: {
				uuid: {
					type: GraphQLString
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
