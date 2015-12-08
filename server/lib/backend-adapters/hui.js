import ApiClient from 'next-ft-api-client';

class Hui {
	constructor(cache) {
		this.type = 'hui';
		this.cache = cache;
	}

	content(facet, uuid, ttl = 50) {
		return this.cache.cached(`${this.type}.${facet}.${uuid}`, ttl, () => {

			let opts = {};
			opts[facet] = uuid;
			return ApiClient.hui(opts);
		});
	}

}

export default Hui;
