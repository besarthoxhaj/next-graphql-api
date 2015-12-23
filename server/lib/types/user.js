import {
	GraphQLEnumType,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLList,
	GraphQLInt
} from 'graphql';

import { Content, Concept } from './content';
import backend from '../backend-adapters/index';

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
			resolve: (source, { limit }, {rootValue: {flags}}) => {
				return backend(flags).myft.savedContent({ uuid: source.uuid, limit: limit } )
					.then(items => {
						if (!items) {
							return [];
						}
						return backend(flags).capi.content(items.map(item => item.uuid), { limit })
					});
			}
		},
		followed: {
			type: new GraphQLList(Concept),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (source, { limit }, {rootValue: {flags}}) => {
				return backend(flags).myft.followedConcepts({ uuid: source.uuid, limit: limit })
					.then(items => {
						if (!items) {
							return [];
						}
						return items
					});
			}
		},
		personalisedFeed: {
			type: new GraphQLList(Content),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (source, { limit }, {rootValue: {flags}}) => {
				return backend(flags).myft.personalisedFeed({ uuid: source.uuid, limit: limit })
					.then(items => {
						if (!items) {
							return [];
						}
						return items.map(item => item.content);
					});
			}
		},
	}
});

export default User;
