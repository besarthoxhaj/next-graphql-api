import {
	GraphQLEnumType,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLList,
	GraphQLInt
} from 'graphql';

import { Content, Concept } from './content';

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
				return backend.userSavedContent({ uuid: source.uuid, limit: limit } )
					.then(items => {
						if (!items) {
							return [];
						}
						return backend.content(items.map(item => item.uuid), { limit })
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
			resolve: (source, { limit }, { rootValue: { backend }}) => {
				return backend.userFollowedConcepts({ uuid: source.uuid, limit: limit })
					.then(items => {
						if (!items) {
							return [];
						}
						console.log(items);
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
			resolve: (source, { limit }, { rootValue: { backend }}) => {
				return backend.userPersonalisedFeed({ uuid: source.uuid, limit: limit })
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
