import myftClient from 'next-myft-client';
import apiClient from 'next-ft-api-client';
import {
	GraphQLEnumType,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLList,
	GraphQLInt
} from 'graphql';

import { Content } from './content';

const Region = new GraphQLEnumType({
	name: 'Region',
	description: 'Region with specific content',
	values: {
		UK: {
			value: 'uk',
			description: 'United Kingdom'
		},
		US: {
			value: 'us',
			description: 'United States of America'
		}
	}
});

const ContentType = new GraphQLEnumType({
	name: 'ContentType',
	description: 'Story type, e.g. article, live blog, video, infographic, etc.',
	values: {
		Article: {
			value: 'article',
			description: 'Basic article'
		},
		LiveBlog: {
			value: 'liveblog',
			description: 'LiveBlog with updates'
		}
	}
});

const LiveBlogStatus = new GraphQLEnumType({
	name: 'LiveBlogStatus',
	description: 'State of the live blog, i.e. coming soon / in progress / closed',
	values: {
		ComingSoon: {
			value: 'comingsoon',
			description: 'Live blog will start, there are no updates'
		},
		InProgress: {
			value: 'inprogress',
			description: 'LiveBlog is currently being updated'
		},
		Closed: {
			value: 'closed',
			description: 'LiveBlog is over'
		}
	}
});

const User = new GraphQLObjectType({
	name: 'User',
	description: 'Represents an FT user',
	fields: {
		uuid: {
			type: new GraphQLNonNull(GraphQLString)
		},
		saved: {
			type: new GraphQLList(Content),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (source, { limit }, { rootValue: { backend }}) => {
				return backend.userArticles(source.uuid)
					.then(res => {
						if (!res || !res.items) {
							return [];
						}
						return backend.content(res.items.map(item => item.uuid), { limit })
					});
			}
		}
	}
});

export {
	Region,
	ContentType,
	LiveBlogStatus,
	User
};
