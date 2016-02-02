import {
	GraphQLString,
	GraphQLInt,
	GraphQLList,
	GraphQLObjectType,
	GraphQLInterfaceType
} from 'graphql';

import { Content } from './content';
import { ContentType } from './basic';
import backend from '../backend-adapters/index';

const Collection = new GraphQLInterfaceType({
	name: 'Collection',
	description: 'Set of items of type Content',
	fields: {
		title: { type: GraphQLString },
		url: { type: GraphQLString },
		layoutHint: { type: GraphQLString },
		items: {
			type: new GraphQLList(Content),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt },
				genres: { type: new GraphQLList(GraphQLString) },
				type: { type: ContentType }
			}
		}
	},
	resolveType: (value) => {
		if (value.apiUrl && /lists\/[a-z\d\-]{36}$/.test(value.apiUrl)) {
			return List;
		} else if (!value.conceptId) {
			return Page;
		} else {
			return ContentByConcept;
		}
	}
});

const Page = new GraphQLObjectType({
	name: 'Page',
	description: 'Page of content',
	interfaces: [Collection],
	fields: {
		url: {
			type: GraphQLString,
			resolve: (it) => {
				return (it.sectionId ? `/stream/sectionsId/${it.sectionId}` : null);
			}
		},
		title: {
			type: GraphQLString
		},
		layoutHint: {
			type: GraphQLString,
			resolve: ([, list]) => list ? list.layoutHint : null
		},
		items: {
			type: new GraphQLList(Content),
			description: 'Content items of the page',
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt },
				genres: { type: new GraphQLList(GraphQLString) },
				type: { type: ContentType }
			},
			resolve: ([page, list], {from, limit, genres, type}, {rootValue: {flags}}) => {
				if(!page.items || page.items.length < 1) { return []; }
				//Picture stories don't come through the page API, so need to take the picture story from the list
				if(list && list.layoutHint === 'standaloneimage' && list.items && list.items.length && list.items[0].id) {
					page.items.unshift(list.items[0].id.replace(/http:\/\/api\.ft\.com\/things?\//, ''));
				}
				return backend(flags).capi.content(page.items, {from, limit, genres, type});
			}
		}
	}
});

const ContentByConcept = new GraphQLObjectType({
	name: 'ContentByConcept',
	description: 'Content annotated by a concept',
	interfaces: [Collection],
	fields: {
		title: {
			type: GraphQLString
		},
		url: {
			type: GraphQLString,
			resolve: () => (null)
		},
		layoutHint: {
			type: GraphQLString,
			resolve: () => null
		},
		items: {
			type: new GraphQLList(Content),
			description: 'Content items',
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt },
				genres: { type: new GraphQLList(GraphQLString) },
				type: { type: ContentType }
			},
			resolve: (result, args, {rootValue: {flags}}) => {
				if(!result.items || result.items.length < 1) { return []; }

				return backend(flags).capi.content(result.items, args);
			}
		}
	}
});

const List = new GraphQLObjectType({
	name: 'List',
	description: 'Items contained in a list',
	interfaces: [Collection],
	fields: {
		title: {
			type: GraphQLString,
			resolve: list => list.title
		},
		url: {
			type: GraphQLString,
			resolve: () => (null)
		},
		layoutHint: {
			type: GraphQLString,
			resolve: list => list.layoutHint
		},
		items: {
			type: new GraphQLList(Content),
			description: 'Content items',
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt },
				genres: { type: new GraphQLList(GraphQLString) },
				type: { type: ContentType }
			},
			resolve: (result, args, {rootValue: {flags}}) => {

				if(!result.items || result.items.length < 1) { return []; }

				return backend(flags).capi.content(result.items.map(result => result.id.replace(/http:\/\/api\.ft\.com\/things?\//, '')), args);
			}
		}
	}
});

export {
	Collection,
	Page,
	ContentByConcept,
	List
};
