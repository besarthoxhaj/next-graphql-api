import { GraphQLString, GraphQLInt, GraphQLList, GraphQLObjectType } from 'graphql';

import { Content } from './content';
import { ContentType } from './basic';
import backendReal from '../backend-adapters/index';

const contentToUiid = content => content.id.replace(/http:\/\/api\.ft\.com\/things?\//, '');

const Page = new GraphQLObjectType({
	name: 'Page',
	description: 'Page of content',
	fields: {
		url: {
			type: GraphQLString,
			resolve: page => page.sectionId ? `/stream/sectionsId/${page.sectionId}` : null
		},
		title: {
			type: GraphQLString
		},
		items: {
			type: new GraphQLList(Content),
			description: 'Content items of the page',
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
			resolve: (page, { from, limit, genres, type }, { rootValue: { flags, backend = backendReal }}) =>
				(page.items && page.items.length) ?
					backend(flags).capi.content(page.items, {from, limit, genres, type}) : []
		}
	}
});

const List = new GraphQLObjectType({
	name: 'List',
	description: 'Items contained in a list',
	fields: {
		title: {
			type: GraphQLString
		},
		layoutHint: {
			type: GraphQLString
		},
		items: {
			type: new GraphQLList(Content),
			description: 'Content items',
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
			resolve: (result, args, { rootValue: { flags, backend = backendReal }}) =>
				(result.items && result.items.length) ? backend(flags).capi.content(result.items.map(contentToUiid), args) : []
		}
	}
});

export { Page, List };
