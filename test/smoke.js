'use strict';

const query = `
	fragment Basic on Content {
			type: __typename
			contentType
			id
			title
			lastPublished
	}

	fragment Extended on Content {
			genre
			summary
			primaryTag {
					id
					url
					taxonomy
					name
			}
			primaryImage {
					src(width: 710)
					alt
			}
	}

	fragment Related on Content {
			relatedContent(limit: 3) {
					id
					title
					genre
					primaryTag {
							id
							url
							taxonomy
							name
					}
			}
	}

	query TopStoriesTest {
			popularTopics {
					name
					url
			}
			top(region: UK) {
					leads: items(limit: 1, type: Article) {
							... Basic
							... Extended
							... Related
					}
					liveBlogs: items(type: LiveBlog) {
							... Basic
							... Extended
							... on LiveBlog {
									status
									updates(limit: 1) {
											date
											text
									}
							}
					}
					items(from: 1, type: Article) {
							... Basic
							... Extended
					}
			}
	}
	`;


module.exports = [
	{
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({
			query: query
		}),
		timeout: 8000,
		urls: {}
	}
];

module.exports[0].urls[`/?apiKey=${process.env.GRAPHQL_API_KEY}`] = 200;
