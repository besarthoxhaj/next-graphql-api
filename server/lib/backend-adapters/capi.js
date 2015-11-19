import ApiClient from 'next-ft-api-client';

class CAPI {
	constructor(cache) {
		this.type = 'capi';
		this.cache = cache;
	}

	page(uuid, ttl = 50) {
		return this.cache.cached(`${this.type}.pages.${uuid}`, ttl, () => {
			return ApiClient.pages({ uuid: uuid });
		});
	}

	byConcept(uuid, ttl = 50) {
		return this.cache.cached(`${this.type}.byconcept.${uuid}`, ttl, () => {
			return ApiClient.contentAnnotatedBy({ uuid: uuid });
		});
	}

	search(query, ttl = 50) {
		return this.cache.cached(`${this.type}.search.${query}`, ttl, () => {
			return ApiClient.searchLegacy({ query: query });
		});
	}

	content(uuids) {
		return this.cache.cached(`${this.type}.content.${uuids.join('_')}`, 50, () => {
			return ApiClient.content({
				uuid: uuids,
				index: 'v3_api_v2'
			});
		});
	}

	list(uuid, ttl = 50) {
		// NOTE: for now, list api is bronze, so handle errors
		return this.cache.cached(`${this.type}.lists.${uuid}`, ttl, () => {
			return ApiClient.lists({ uuid: uuid });
		});
	}
}

export default CAPI;
