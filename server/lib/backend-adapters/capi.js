import ApiClient from 'next-ft-api-client';

class CAPI {
	constructor(cache, opts = {}) {
		this.elasticSearch = opts.elasticSearch;
		this.elasticSearchAws = opts.elasticSearchAws;
		this.type = this.elasticSearch ? (this.elasticSearchAws ? 'elasticsearch-aws' : 'elasticsearch') : 'capi';
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
			return ApiClient.searchLegacy({
				query: query,
				useElasticSearch: this.elasticSearch,
				useElasticSearchOnAws: this.elasticSearchAws
			});
		});
	}

	contentv1(uuids) {
		const promises = [].concat(uuids).map((uuid) => {
			return this.cache.cached(`${this.type}.contentv1.${uuid}`, 50, () => {
				return ApiClient.contentLegacy({
					uuid: uuid,
					useElasticSearch: this.elasticSearch,
					useElasticSearchOnAws: this.elasticSearchAws
				});
			});
		});
		return Promise.all(promises).then((items) => {
			return items.filter((item) => {
				return !!item;
			});
		});
	}

	contentv2(uuids) {
		const promises = [].concat(uuids).map((uuid) => {
			return this.cache.cached(`${this.type}.contentv2.${uuid}`, 50, () => {
				return ApiClient.content({
					uuid: uuid,
					useElasticSearch: this.elasticSearch,
					useElasticSearchOnAws: this.elasticSearchAws
				});
			});
		});
		return Promise.all(promises).then((items) => {
			return items.filter((item) => {
				return !!item;
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
