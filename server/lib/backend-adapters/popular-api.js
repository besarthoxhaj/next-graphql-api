import sliceList from '../helpers/slice-list';

class PopularAPI {
	constructor(cache) {
		this.cache = cache;
		this.baseUrl = 'https://ft-next-popular-api.herokuapp.com';
		this.apiKey = process.env.POPULAR_API_KEY;
	}

	topics({from, limit}, ttl = 50) {

		const url = `${this.baseUrl}/topics?apiKey=${this.apiKey}`;

		return this.cache.cached('popular-api.topics', ttl, () => {
			return fetch(url)
				.then(response => response.json())
		})
			.then(topics => sliceList(topics, {from, limit}));
	}

	articles({from, limit}, ttl = 50) {
		const url = `${this.baseUrl}/articles?apiKey=${this.apiKey}`;

		return this.cache.cached('popular-api.articles', ttl, () => {
			return fetch(url)
				.then(response => response.json())
				.then(json => (json.articles || []).map(article => article.uuid))
		})
			.then(articles => sliceList(articles, {from, limit}));
	}
}

export default PopularAPI;
