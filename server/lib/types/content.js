import articleGenres from 'ft-next-article-genre';
import articleBranding from 'ft-n-article-branding';

import capifyMetadata from '../helpers/capifyMetadata';

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
		if (/liveblog|marketslive|liveqa/i.test(value.webUrl)) {
			return LiveBlog;
		} else {
			return Article;
		}
	},
	fields: () => ({
		id: {
			type: GraphQLID
		},
		contentType: {
			type: ContentType
		},
		title: {
			type: GraphQLString
		},
		genre: {
			type: GraphQLString
		},
		branding: {
			type: Concept
		},
		summary: {
			type: GraphQLString
		},
		primaryTag: {
			type: Concept
		},
		primaryImage: {
			type: Image
		},
		lastPublished: {
			type: GraphQLString
		},
		relatedContent: {
			type: new GraphQLList(Content),
			args: {
				from: {
					type: GraphQLInt
				},
				limit: {
					type: GraphQLInt
				}
			}
		}
	})
});

const Article = new GraphQLObjectType({
	name: 'Article',
	description: 'Content item',
	interfaces: [Content],
	fields: () => ({
		id: {
			type: GraphQLID
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
			resolve: content => articleGenres(capifyMetadata(content.metadata))
		},
		branding: {
			type: Concept,
			// NOTE: need to copy metadata, as it's passed around by reference
			resolve: content => articleBranding(JSON.parse(JSON.stringify(content.metadata)))
		},
		summary: {
			type: GraphQLString,
			resolve: content => (content.summaries && content.summaries.length) ? content.summaries[0] : null
		},
		primaryTag: {
			type: Concept,
			resolve: content => {
				const primarySection = content.metadata.find(tag => tag.primary === 'section');
				const primaryTheme = content.metadata.find(tag => tag.primary === 'theme');
				return primaryTheme || primarySection || null;
			}
		},
		primaryImage: {
			type: Image,
			resolve: content => content.mainImage
		},
		lastPublished: {
			type: GraphQLString,
			resolve: content => content.publishedDate
		},
		relatedContent: {
			type: new GraphQLList(Content),
			args: {
				from: {
					type: GraphQLInt
				},
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (content, { from, limit }, { rootValue: { backend }}) => {
				let storyPackageIds = content.storyPackage.map(story => story.id);
				if (storyPackageIds.length < 1) {
					return [];
				}
				return backend.content(storyPackageIds, { from, limit });
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
			type: GraphQLID
		},
		contentType: {
			type: ContentType,
			description: 'Type of content',
			resolve: () => 'liveblog'
		},
		title: {
			type: GraphQLString
		},
		genre: {
			type: GraphQLString,
			resolve: content => articleGenres(capifyMetadata(content.metadata))
		},
		branding: {
			type: Concept,
			// NOTE: need to copy metadata, as it's passed around by reference
			resolve: content => articleBranding(JSON.parse(JSON.stringify(content.metadata)))
		},
		summary: {
			type: GraphQLString,
			resolve: content => content.summaries.length ? content.summaries[0] : null
		},
		primaryTag: {
			type: Concept,
			resolve: content => {
				const primarySection = content.metadata.find(tag => tag.primary === 'section');
				const primaryTheme = content.metadata.find(tag => tag.primary === 'theme');
				return primaryTheme || primarySection || null;
			}
		},
		primaryImage: {
			type: Image,
			resolve: content => content.mainImage
		},
		lastPublished: {
			type: GraphQLString,
			resolve: content => content.publishedDate
		},
		relatedContent: {
			type: new GraphQLList(Content),
			args: {
				from: {
					type: GraphQLInt
				},
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (content, { from, limit }, { rootValue: { backend }}) => {
				let storyPackageIds = content.storyPackage.map(story => story.id);
				if (storyPackageIds.length < 1) {
					return [];
				}
				return backend.content(storyPackageIds, { from, limit });
			}
		},
		status: {
			type: LiveBlogStatus,
			resolve: (content, _, { rootValue: { backend }}) => (
					backend.liveblogExtras(content.webUrl, {})
						.then(extras => extras.status)
			)
		},
		updates: {
			type: new GraphQLList(LiveBlogUpdate),
			args: {
				limit: {
					type: GraphQLInt
				}
			},
			resolve: (content, { limit }, { rootValue: { backend }}) => (
					backend.liveblogExtras(content.webUrl, { limit })
						.then(extras => extras.updates)
			)
		}
	})
});

const Concept = new GraphQLObjectType({
	name: 'Concept',
	description: 'Metadata tag describing a person/region/brand/...',
	fields: () => ({
		id: {
			type: GraphQLID,
			description: 'Concept id',
			resolve: concept => concept.id || concept.idV1
		},
		taxonomy: {
			type: GraphQLString,
			description: 'Type of the concept'
		},
		name: {
			type: GraphQLString,
			description: 'Name of the concept',
			resolve: concept => concept.name || concept.prefLabel
		},
		url: {
			type: GraphQLString,
			description: 'Stream URL for the concept',
			resolve: concept => `/stream/${concept.taxonomy}Id/${concept.id || concept.idV1}`
		},
		attributes: {
			type: new GraphQLList(ConceptAttributes)
		},
		headshot: {
			type: GraphQLString
		}
	})
});

const ConceptAttributes = new GraphQLObjectType({
	name: 'ConceptAttributes',
	description: 'Attribtues of a tag',
	fields: () => ({
		key: {
			type: GraphQLString
		},
		value: {
			type: GraphQLString
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
				width: {
					type: new GraphQLNonNull(GraphQLInt)
				}
			},
			resolve: (image, { width }) => `//next-geebee.ft.com/image/v1/images/raw/${image.url}?source=next&fit=scale-down&width=${width}`
		},
		rawSrc: {
			type: GraphQLString,
			description: 'Original source URL of the image',
			resolve: image => image.url
		},
		alt: {
			type: GraphQLString,
			description: 'Alternative text',
			resolve: image => image.description
		}
	})
});

const LiveBlogUpdate = new GraphQLObjectType({
	name: 'LiveBlogUpdate',
	description: 'Update of a live blog',
	fields: () => ({
		event: {
			type: GraphQLString
		},
		author: {
			type: GraphQLString,
			resolve: update => update.data && update.data.authordisplayname
		},
		date: {
			type: GraphQLString,
			resolve: update => update.data && new Date(update.data.datemodified * 1000).toISOString()
		},
		text: {
			type: GraphQLString,
			resolve: update => update.data && update.data.text
		},
		html: {
			type: GraphQLString,
			resolve: update => update.data && update.data.html
		}
	})
});

const Video = new GraphQLObjectType({
	name: 'Video',
	description: 'A Video',
	fields: () => ({
		id: {
			type: GraphQLID
		},
		title: {
			type: GraphQLString,
			resolve: video => video.name
		},
		description: {
			type: GraphQLString,
			resolve: video => video.longDescription
		},
		lastPublished: {
			type: GraphQLString,
			resolve: video => video.publishedDate
		},
		image: {
			type: Image,
			resolve: video => ({
				url: video.videoStillURL,
				alt: video.name
			})
		},
		renditions: {
			type: new GraphQLList(Rendition),
			resolve: video => video.renditions
		}
	})
});

const Rendition = new GraphQLObjectType({
	name: 'Rendition',
	description: 'A Video\'s rendition',
	fields: () => ({
		id: {
			type: GraphQLID
		},
		url: {
			type: GraphQLString
		},
		frameWidth: {
			type: GraphQLInt
		},
		frameHeight: {
			type: GraphQLInt
		},
		videoCodec: {
			type: GraphQLString
		}
	})
});

export default {
	Content,
	Concept,
	Video
};
