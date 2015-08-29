import articleGenres from 'ft-next-article-genre';
import articlePrimaryTag from 'ft-next-article-primary-tag';

import {
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	GraphQLList,
	GraphQLObjectType,
	GraphQLInterfaceType,
	GraphQLNonNull
} from 'graphql';

import {
	LiveBlogStatus,
	ContentType
} from './basic';

const Content = new GraphQLInterfaceType({
	name: 'Content',
	description: 'A piece of FT content',
	resolveType: (value) => {
		// This logic is unfortunately duplicated in the backend. The clean way would be
		// to use the backend here, but GraphQL unfortunately doesn't pass the execution
		// context to us here.
		// Logged as https://github.com/graphql/graphql-js/issues/103

		if (value.item && !!value.item.location.uri.match(/liveblog|marketslive|liveqa/i)) {
			return LiveBlog;
		} else if (value.item) {
			return ContentV1;
		} else {
			return ContentV2;
		}
	},
	fields: () => ({
		id: { type: GraphQLID },
		contentType: { type: ContentType },
		title: { type: GraphQLString },
		genre: { type: GraphQLString },
		summary: { type: GraphQLString },
		primaryTag: { type: Concept },
		primaryImage: { type: Image },
		lastPublished: { type: GraphQLString },
		relatedContent: {
			type: new GraphQLList(Content),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt }
			}
		}
	})
});

const Concept = new GraphQLObjectType({
	name: 'Concept',
	description: 'Metadata tag describing a person/region/brand/...',
	fields: () => ({
		id: {
			type: GraphQLID,
			description: 'Concept id'
		},
		taxonomy: {
			type: GraphQLString,
			description: 'Type of the concept'
		},
		name: {
			type: GraphQLString,
			description: 'Name of the concept'
		},
		url: {
			type: GraphQLString,
			description: 'Stream URL for the concept',
			resolve: (concept) => {
				return `/stream/${concept.taxonomy}Id/${concept.id}`;
			}
		}
	})
});

const Image = new GraphQLObjectType({
	name: 'Image',
	description: 'An image',
	fields: () => ({
		src: {
			type: GraphQLString,
			description: 'Source URL of the image',
			args: {
				width: { type: new GraphQLNonNull(GraphQLInt) }
			},
			resolve: (it, {width}) => {
				return `//next-geebee.ft.com/image/v1/images/raw/${it.url}?source=next&fit=scale-down&width=${width}`;
			}
		},
		alt: {
			type: GraphQLString,
			description: 'Alternative text'
		}
	})
});

const Video = new GraphQLObjectType({
	name: 'Video',
	description: 'A Video',
	fields: () => ({
		id: { type: GraphQLID },
		title: {
			type: GraphQLString,
			resolve: (it) => it.name
		},
		description: {
			type: GraphQLString,
			resolve: (it) => it.longDescription
		},
		lastPublished: {
			type: GraphQLString,
			resolve: (it) => it.publishedDate
		},
		image: {
			type: Image,
			resolve: (it) => {
				return {
					url: it.videoStillURL,
					alt: it.name
				};
			}
		}
	})
});

const ImageTypePriority = [
	'wide-format',
	'article',
	'leader',
	'primary',
	'secondary'
];

const ContentV1 = new GraphQLObjectType({
	name: 'ContentV1',
	description: 'Content item',
	interfaces: [Content],
	fields: {
		id: {
			type: GraphQLID,
			resolve: (content) => content.item.id
		},
		contentType: {
			type: ContentType,
			description: 'Type of content',
			resolve: () => 'article'
		},
		title: {
			type: GraphQLString,
			resolve: (content) => {
				return content.item.title.title;
			}
		},
		genre: {
			type: GraphQLString,
			resolve: (content) => articleGenres(content.item.metadata)
		},
		summary: {
			type: GraphQLString,
			resolve: (content) => content.item.summary.excerpt
		},
		primaryTag: {
			type: Concept,
			resolve: (content) => {
				return articlePrimaryTag(content.item.metadata);
			}
		},
		primaryImage: {
			type: Image,
			resolve: (content) => {
				let imageMap = content.item.images.reduce((map, it) => {
					return Object.assign({[it.type]: it}, map);
				}, {});
				let type = ImageTypePriority.find(it => !!imageMap[it]);

				return imageMap[type];
			}
		},
		lastPublished: {
			type: GraphQLString,
			resolve: (content) => {
				return content.item.lifecycle.lastPublishDateTime;
			}
		},
		relatedContent: {
			type: new GraphQLList(Content),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt }
			},
			resolve: (content, {from, limit}, {backend}) => {
				let ids = content.item.package.map(it => it.id);
				if(ids.length < 1) { return []; }

				return backend.contentv1(ids, {from, limit});
			}
		}
	}
});

const LiveBlogUpdate = new GraphQLObjectType({
	name: 'LiveBlogUpdate',
	description: 'Update of a live blog',
	fields: () => ({
		event: { type: GraphQLString },
		author: {
			type: GraphQLString,
			resolve: (update) => {
				return update.data && update.data.authordisplayname;
			}
		},
		date: {
			type: GraphQLString,
			resolve: (update) => {
				return update.data && new Date(update.data.datemodified * 1000).toISOString();
			}
		},
		text: {
			type: GraphQLString,
			resolve: (update) => {
				return update.data && update.data.text;
			}
		},
		html: {
			type: GraphQLString,
			resolve: (update) => {
				return update.data && update.data.html;
			}
		}
	})
});

const LiveBlog = new GraphQLObjectType({
	name: 'LiveBlog',
	description: 'Live blog item',
	interfaces: [Content],
	fields: () => ({
		id: {
			type: GraphQLID,
			resolve: (content) => content.item.id
		},
		contentType: {
			type: ContentType,
			description: 'Type of content',
			resolve: () => 'liveblog'
		},
		title: {
			type: GraphQLString,
			resolve: (content) => {
				return content.item.title.title;
			}
		},
		genre: {
			type: GraphQLString,
			resolve: (content) => articleGenres(content.item.metadata)
		},
		summary: {
			type: GraphQLString,
			resolve: (content) => content.item.summary.excerpt
		},
		primaryTag: {
			type: Concept,
			resolve: (content) => {
				return articlePrimaryTag(content.item.metadata);
			}
		},
		primaryImage: {
			type: Image,
			resolve: (content) => {
				let imageMap = content.item.images.reduce((map, it) => {
					return Object.assign({[it.type]: it}, map);
				}, {});
				let type = ImageTypePriority.find(it => !!imageMap[it]);

				return imageMap[type];
			}
		},
		lastPublished: {
			type: GraphQLString,
			resolve: (content) => {
				return content.item.lifecycle.lastPublishDateTime;
			}
		},
		relatedContent: {
			type: new GraphQLList(Content),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt }
			},
			resolve: (content, {from, limit}, {backend}) => {
				let ids = content.item.package.map(it => it.id);
				if(ids.length < 1) { return []; }

				return backend.contentv1(ids, {from, limit});
			}
		},
		status: {
			type: LiveBlogStatus,
			resolve: (content, _, {backend}) => {
				const uri = content.item.location.uri;

				return backend.liveblogExtras(uri, {}).then(it => it.status);
			}
		},
		updates: {
			type: new GraphQLList(LiveBlogUpdate),
			args: {
				limit: { type: GraphQLInt }
			},
			resolve: (content, {limit}, {backend}) => {
				const uri = content.item.location.uri;

				return backend.liveblogExtras(uri, {limit}).then(it => it.updates);
			}
		}
	})
});

const ContentV2 = new GraphQLObjectType({
	name: 'ContentV2',
	description: 'Content item',
	interfaces: [Content],
	fields: () => ({
		id: {
			type: GraphQLID,
			resolve: (content) => {
				return content.id.replace('http://www.ft.com/thing/', '');
			}
		},
		contentType: {
			type: ContentType,
			description: 'Type of content',
			resolve: () => 'article'
		},
		title: {
			type: GraphQLString
		},
		genre: {
			type: GraphQLString,
			resolve: (content) => articleGenres(content.item.metadata)
		},
		summary: {
			type: GraphQLString,
			resolve: (content) => content.item.summary.excerpt
		},
		primaryTag: {
			type: Concept,
			resolve: (content) => {
				return articlePrimaryTag(content.item.metadata);
			}
		},
		primaryImage: {
			type: Image,
			resolve: (content) => {
				let imageMap = content.item.images.reduce((map, it) => {
					return Object.assign({[it.type]: it}, map);
				}, {});
				let type = ImageTypePriority.find(it => !!imageMap[it]);

				return imageMap[type];
			}
		},
		lastPublished: {
			type: GraphQLString,
			resolve: (content) => {
				return content.publishedDate;
			}
		},
		relatedContent: {
			type: new GraphQLList(Content),
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt }
			},
			resolve: (content, {from, limit}, {backend}) => {
				let ids = content.item.package.map(it => it.id);
				if(ids.length < 1) { return []; }

				return backend.contentv2(ids, {from, limit});
			}
		}
	})
});

export default {
	Content,
	Concept,
	Image,
	Video,
	ContentV1,
	ContentV2
};
