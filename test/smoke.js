const query = `
	query GraphQLSmoke {
		top(region: UK) {
			lead: items(limit: 1, type: Article) {
				title
			}
			liveBlogs: items(type: LiveBlog) {
				title
			}
			items(from: 1, type: Article) {
				title
			}
		}
		topStoriesList(region: UK) {
			layoutHint
			items(limit: 10) {
				title
			}
		}
		fastFT(limit: 5) {
			title
		}
		opinion {
			url
			items {
				title
				branding {
					headshot
					taxonomy
				}
			}
		}
		popularTopics {
			name
			items(limit: 1) {
				title
			}
		}
		editorsPicks {
			title
			items(limit: 6) {
				title
			}
		}
		popularArticles {
			title
		}
		technology {
			url
			items(limit: 2, genres: ["analysis", "comment"]) {
				title
			}
		}
		markets {
			url
			items(limit: 2, genres: ["analysis", "comment"]) {
				title
			}
		}
		lifestyle {
			url
			items(limit: 2) {
				title
			}
		}
		videos {
			id
			title
		}
	}
`;

const getTestUrls = {};
getTestUrls['/data?query=' + query] = 200;

module.exports = [
	{
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-API-KEY': process.env.GRAPHQL_API_KEY
		},
		method: 'POST',
		body: JSON.stringify({
			query: query
		}),
		timeout: 8000,
		urls: {
			'/data': 200
		}
	},
	{
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-API-KEY': process.env.GRAPHQL_API_KEY
		},
		method: 'GET',
		timeout: 8000,
		urls: getTestUrls
	}
];
