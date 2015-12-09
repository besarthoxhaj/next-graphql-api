const query = `
	query GraphQLSmoke {
		popularTopics {
			name
		}
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
		fastFT {
			items(limit: 5) {
				title
			}
		}
		editorsPicks {
			title
			items(limit: 6) {
				title
			}
		}
		opinion {
			url
			items {
				title
			}
		}
		lifestyle {
			url
			items(limit: 2) {
				title
			}
		}
		markets {
			url
			items(limit: 2, genres: ["analysis", "comment"]) {
				title
			}
		}
		technology {
			url
			items(limit: 2, genres: ["analysis", "comment"]) {
				title
			}
		}
		popular {
			items(limit: 10) {
				title
			}
		}
		videos {
			id
			title
		}
	}`;

const getTestUrls = {};
getTestUrls['/?query=' + query] = 200;

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
			'/': 200
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
