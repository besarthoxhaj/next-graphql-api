import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt
} from 'graphql';

import { Content, Concept } from './content';
import backend from '../backend-adapters/index';

const auth = (requestedUUID, sessionUUID, isUserRequest) => {
	const uuid = sessionUUID || (!isUserRequest && requestedUUID);
	if(uuid) {
		if(sessionUUID && requestedUUID && sessionUUID !== requestedUUID) {
			throw 401;
		} else {
			return uuid;
		}
	} else {
			throw new Error(isUserRequest ? 401 : 'Must specify a user UUID');
	}
};

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

				const uuid = auth(source.uuid, userUuid, isUserRequest);

				return backend(flags).myft.getAllRelationship(uuid, 'saved', 'content', { limit })
					.then(items => !items ? [] :backend(flags).capi.content(items.map(item => item.uuid), { limit }));
			}
		},
		read: {
			type: new GraphQLList(Content),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (source, { limit=10 }, {rootValue: {flags, isUserRequest, userUuid}}) => {

				const uuid = auth(source.uuid, userUuid, isUserRequest);

				return backend(flags).myft.getAllRelationship(uuid, 'read', 'content', { limit })
					.then(items => !items ? [] : backend(flags).capi.content(items.map(item => item.uuid), { limit }));
			}
		},
		followed: {
			type: new GraphQLList(Concept),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (source, { limit = 10 }, {rootValue: {flags, isUserRequest, userUuid}}) => {
				const uuid = auth(source.uuid, userUuid, isUserRequest);
				return backend(flags).myft.personalisedFeed(uuid, { limit });
			}
		},
		viewed: {
			type: new GraphQLList(Concept),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (source, { limit = 10 }, { rootValue: { flags, isUserRequest, userUuid }}) => {
				const uuid = auth(source.uuid, userUuid, isUserRequest);
				return backend(flags).myft.getViewed(uuid, { limit })
					.then(concepts => !concepts ? [] : concepts);
			}
		},
		personalisedFeed: {
			type: new GraphQLList(Content),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (source, { limit=10 }, {rootValue: {flags, isUserRequest, userUuid}}) => {
				const uuid = auth(source.uuid, userUuid, isUserRequest);
				return backend(flags).myft.personalisedFeed(uuid, { limit })
					.then(items => !items ? [] : items.map(item => item.content));
			}
		}
	}
});

export default User;
