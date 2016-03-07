import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import articleGenres from 'ft-next-article-genre';
import articleBranding from 'ft-n-article-branding';

import capifyMetadata from '../helpers/capify-metadata';
import backendReal from '../backend-adapters/index';
import { LiveBlogStatus, ContentType } from './basic';

const podcastIdV1 = 'NjI2MWZlMTEtMTE2NS00ZmI0LWFkMzMtNDhiYjA3YjcxYzIy-U2VjdGlvbnM=';

const propertyEquals = (property, value) => (item) => item[property] === value;

// TODO: rather hacky way of getting the headshot url from ft-n-article-branding
const getAuthorHeadshot = (id, name) => {
	const metadata = [
		{
			taxonomy: 'authors',
			idV1: id,
			prefLabel: name,
			attributes: []
		},
		{
			taxonomy: 'genre',
			prefLabel: 'Comment'
		}
	];
	return articleBranding(metadata).headshot;
};

const Content = new GraphQLInterfaceType({
	name: 'Content',
	description: 'A piece of FT content',
	resolveType: content => {
		if (/liveblog|marketslive|liveqa/i.test(content.webUrl)) {
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
		tags: {
			type: new GraphQLList(Concept),
			args: {
				only: {
					type: new GraphQLList(GraphQLString),
					description: 'Only return tags which match one of these taxonomies'
				},
				not: {
					type: new GraphQLList(GraphQLString),
					description: 'Don\'t return tags which match one of these taxonomies'
				}
			}
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
		},
		authors: {
			type: new GraphQLList(Author)
		}
	})
});

const getContentFields = () => ({
	id: {
		type: GraphQLID
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
		resolve: content => articleBranding(content.metadata.slice())
	},
	summary: {
		type: GraphQLString,
		resolve: content => (content.summaries && content.summaries.length) ? content.summaries[0] : null
	},
	tags: {
		type: new GraphQLList(Concept),
		args: {
			only: {
				type: new GraphQLList(GraphQLString),
				description: 'Only return tags which match one of these taxonomies'
			},
			not: {
				type: new GraphQLList(GraphQLString),
				description: 'Don\'t return tags which match one of these taxonomies'
			}
		},
		resolve: (content, { only, not = [] }) => {
			const tags = (only && only.length) ?
				content.metadata.filter(tag => only.includes(tag.taxonomy)) : content.metadata;
			return not.length ? tags.filter(tag => !not.includes(tag.taxonomy)) : tags;
		}
	},
	primaryTag: {
		type: Concept,
		resolve: content => {
			const primaryTheme = content.metadata.find(propertyEquals('primary', 'theme'));
			const primarySection = content.metadata.find(propertyEquals('primary', 'section'));
			return primaryTheme || primarySection;
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
			from: { type: GraphQLInt },
			limit: { type: GraphQLInt }
		},
		resolve: (content, { from, limit }, { rootValue: { flags, backend = backendReal }}) => {
			const storyPackageIds = (content.storyPackage || []).map(story => story.id);
			return storyPackageIds.length ? backend(flags).capi.content(storyPackageIds, { from, limit }) : [];
		}
	},
	authors: {
		type: new GraphQLList(Author),
		resolve: content =>
			content.metadata
				.filter(propertyEquals('taxonomy', 'authors'))
				.map(author => ({
					id: author.idV1,
					name: author.prefLabel,
					headshot: getAuthorHeadshot(author.idV1, author.prefLabel),
					isBrand: author.primary === 'brand',
					url: `/stream/authorsId/${author.idV1}`
				}))
	}
});

const Article = new GraphQLObjectType({
	name: 'Article',
	description: 'Content item',
	interfaces: [Content],
	fields: () => Object.assign(getContentFields(), {
		contentType: {
			type: ContentType,
			description: 'Type of content',
			resolve: () => 'article'
		},
		isPodcast: {
			type: GraphQLBoolean,
			resolve: content => content.metadata.some(propertyEquals('idV1', podcastIdV1))
		}
	})
});

const LiveBlog = new GraphQLObjectType({
	name: 'LiveBlog',
	description: 'Live blog item',
	interfaces: [Content],
	fields: () => Object.assign(getContentFields(), {
		contentType: {
			type: ContentType,
			description: 'Type of content',
			resolve: () => 'liveblog'
		},
		status: {
			type: LiveBlogStatus,
			resolve: (content, _, { rootValue: { flags, backend = backendReal }}) => (
				backend(flags).liveblog.fetch(content.webUrl, { })
					.then(extras => extras.status)
			)
		},
		updates: {
			type: new GraphQLList(LiveBlogUpdate),
			args: {
				limit: { type: GraphQLInt }
			},
			resolve: (content, { limit }, { rootValue: { flags, backend = backendReal }}) => (
				backend(flags).liveblog.fetch(content.webUrl, { limit })
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
			resolve: concept => concept.id || concept.idV1 || concept.uuid
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
			resolve: concept => `/stream/${concept.taxonomy}Id/${concept.id || concept.idV1 || concept.uuid}`
		},
		attributes: {
			type: new GraphQLList(ConceptAttributes)
		},
		headshot: {
			type: GraphQLString
		},
		items: {
			type: new GraphQLList(Content),
			description: 'Latest articles published with this concept',
			args: {
				from: { type: GraphQLInt },
				limit: { type: GraphQLInt },
				genres: { type: new GraphQLList(GraphQLString) },
				type: { type: ContentType }
			},
			resolve: (concept, { from, limit, genres, type }, { rootValue: { flags, backend = backendReal }}) => {
				const id = concept.id || concept.idV1 || concept.uuid;
				return backend(flags).capi.search('metadata.idV1', id, { from, limit, genres, type });
			}
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
			resolve: (image, { width }) =>
				`//next-geebee.ft.com/image/v1/images/raw/${image.url}?source=next&fit=scale-down&width=${width}`
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
			type: new GraphQLList(Rendition)
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

const Author = new GraphQLObjectType({
	name: 'Author',
	fields: () => ({
		id: {
			type: GraphQLID
		},
		name: {
			type: GraphQLString
		},
		headshot: {
			type: GraphQLString
		},
		isBrand: {
			type: GraphQLBoolean
		},
		url: {
			type: GraphQLString
		}
	})
});

export { Content, Concept, Video };
