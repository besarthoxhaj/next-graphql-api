import {
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
			type: GraphQLString
		},
		saved: {
			type: new GraphQLList(Content),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (source, { limit=10 }, {rootValue: {flags, isUserRequest, userUuid}}) => {
				console.log(isUserRequest, userUuid, source);
				const uuid = userUuid || (!isUserRequest && source.uuid);
				if(!uuid) {
					throw 401;
				};
				return backend(flags).myft.savedContent({ uuid: uuid, limit: limit } )
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
			resolve: (source, { limit=10 }, {rootValue: {flags}}) => {
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
			resolve: (source, { limit=10 }, {rootValue: {flags}}) => {
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
