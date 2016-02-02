import {
	GraphQLString,
	GraphQLInt,
	GraphQLList,
	GraphQLObjectType
} from 'graphql';

import { Content } from './content';
import { ContentType } from './basic';
import backend from '../backend-adapters/index';


const CombinedPageAndList = new GraphQLObjectType({
	name: 'CombinedPageAndList',
	description: 'Page of content with metadata from List',
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

const Page = new GraphQLObjectType({
	name: 'Page',
	description: 'Page of content',
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
			resolve: () => null
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
			resolve: (page, {from, limit, genres, type}, {rootValue: {flags}}) => {
				if(!page.items || page.items.length < 1) { return []; }
				return backend(flags).capi.content(page.items, {from, limit, genres, type});
			}
		}
	}
});

const ContentByConcept = new GraphQLObjectType({
	name: 'ContentByConcept',
	description: 'Content annotated by a concept',
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
	Page,
	CombinedPageAndList,
	ContentByConcept,
	List
};
