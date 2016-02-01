import ApiClient from 'next-ft-api-client';
import filterContent from '../helpers/filter-content';
import resolveContentType from '../helpers/resolve-content-type';


class CAPI {
	constructor(cache) {
		this.type = 'capi';
		this.cache = cache;
	}

	page(uuid, sectionsId, ttl = 50) {
		return this.cache.cached(`${this.type}.pages.${uuid}`, ttl, () => {
			return ApiClient.pages({ uuid: uuid })
				.then(it => ({
					id: uuid,
					title: it.title,
					sectionId: sectionsId,
					items: it.slice()
				}))
		});
	}

	byConcept(uuid, title, ttl = 50) {
		return this.cache.cached(`${this.type}.byconcept.${uuid}`, ttl, () => {
			return ApiClient.contentAnnotatedBy({ uuid: uuid })
				.then(ids => ({
					title: title,
					conceptId: uuid,
					sectionId: null,
					items: ids.slice()
				}));
		});
	}

	searchLegacy(query, ttl = 50) {
		return this.cache.cached(`${this.type}.searchLegacy.${query}`, ttl, () => {

			console.log('searching for query', query);
			return ApiClient.searchLegacy({ query: query })
			.then(console.log);
		});
	}

	content(uuids, opts, ttl=50) {
		const cacheKey = `${this.type}.content.${Array.isArray(uuids) ? uuids.join('_') : uuids}`;
		return this.cache.cached(cacheKey, ttl, () => {
			return ApiClient.content({
				uuid: uuids,
				index: 'v3_api_v2'
			})
		})
		.then(filterContent(opts, resolveContentType))
	}

	list(uuid, ttl = 50) {
		return this.cache.cached(`${this.type}.lists.${uuid}`, ttl, () => {
			return ApiClient.lists({ uuid: uuid })
		});
	}
}

export default CAPI;
