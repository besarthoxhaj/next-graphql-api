class PopularAPI {
	constructor(cache) {
		this.cache = cache;
	}

	topics(ttl = 50) {
		const url = 'https://ft-next-popular-api.herokuapp.com/topics?apiKey=' + process.env.POPULAR_API_KEY;

		return this.cache.cached('popular-api.topics', ttl, () => {
			return fetch(url)
			.then((response) => response.json());
		});
	}
}

export default PopularAPI;
