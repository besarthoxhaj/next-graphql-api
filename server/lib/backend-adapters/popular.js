class Popular {
	constructor(cache) {
		this.cache = cache;
	}

	fetch(url, ttl = 50) {
		return this.cache.cached(`popular.${url}`, ttl, () => {
			return fetch(url)
			.then((response) => response.json());
		});
	}
}

export default Popular;
