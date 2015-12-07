import ApiClient from 'next-ft-api-client';

class Hui {
	constructor(cache) {
		this.type = 'hui';
		this.cache = cache;
	}

	list(facet, uuid, ttl = 50) {
		return this.cache.cached(`${this.type}.${facet}.${uuid}`, ttl, () => {

			let opts = {};
			opts[facet] = uuid;
			return ApiClient.hui(opts);
		});
	}

	content(uuids) {
		const cacheKey = `${this.type}.content.${Array.isArray(uuids) ? uuids.join('_') : uuids}`;
		return this.cache.cached(cacheKey, 50, () => {
			return ApiClient.content({
				uuid: uuids,
				index: 'v3_api_v2'
			});
		});
	}

}

export default Hui;
