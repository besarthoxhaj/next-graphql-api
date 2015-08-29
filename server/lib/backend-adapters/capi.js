import ApiClient from 'next-ft-api-client';

class CAPI {
	constructor(elasticSearch, cache) {
		this.elasticSearch = elasticSearch;
		this.type = (elasticSearch ? 'elasticsearch' : 'capi');
		this.cache = cache;
	}

	page(uuid, ttl = 50) {
		return this.cache.cached(`${this.type}.pages.${uuid}`, ttl, () => {
			return ApiClient.pages({ uuid: uuid });
		});
	}

	byConcept(uuid, ttl = 50) {
		return this.cache.cached(`${this.type}.byconcept.${uuid}`, ttl, () => {
			return ApiClient.contentAnnotatedBy({
				uuid: uuid,
				useElasticSearch: this.elasticSearch
			});
		});
	}

	search(query, ttl = 50) {
		return this.cache.cached(`${this.type}.search.${query}`, ttl, () => {
			return ApiClient.searchLegacy({
				query: query,
				useLegacyContent: true,
				useElasticSearch: this.elasticSearch
			});
		});
	}

	contentv1(uuids) {
		return this.cache.cached(`${this.type}.contentv1.${uuids.join('_')}`, 50, () => {
			return ApiClient.contentLegacy({
				uuid: uuids,
				useElasticSearch: this.elasticSearch
			});
		});
	}

	contentv2(uuids) {
		return this.cache.cached(`${this.type}.contentv2.${uuids.join('_')}`, 50, () => {
			return ApiClient.content({
				uuid: uuids,
				useElasticSearch: this.elasticSearch
			});
		});
	}
}

export default CAPI;
