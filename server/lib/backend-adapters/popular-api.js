import sliceList from '../helpers/slice-list';

export default class {
	constructor (cache) {
		this.cache = cache;
		this.baseUrl = 'https://ft-next-popular-api.herokuapp.com';
		this.apiKey = process.env.POPULAR_API_KEY;
	}

	topics ({ from, limit } = {}, ttl = 50) {
		const url = `${this.baseUrl}/topics?apiKey=${this.apiKey}`;

		return this.cache.cached('popular-api.topics', ttl, () =>
				fetch(url).then(response => response.json())
			)
			.then(topics => sliceList(topics, { from, limit }));
	}

	articles ({ from, limit } = {}, ttl = 50) {
		const url = `${this.baseUrl}/articles?apiKey=${this.apiKey}`;

		return this.cache.cached('popular-api.articles', ttl, () =>
				fetch(url)
					.then(response => response.json())
					.then(json => (json.articles || []).map(article => article.uuid))
			)
			.then(articles => sliceList(articles, { from, limit }));
	}
}
