import logger from '@financial-times/n-logger';
import { json as fetchresJson } from 'fetchres';
import ApiClient from 'next-ft-api-client';

import filterContent from '../helpers/filter-content';
import resolveContentType from '../helpers/resolve-content-type';

export default class {
	constructor (cache) {
		this.type = 'capi';
		this.cache = cache;
	}

	page (uuid, sectionsId, ttl = 60) {
		return this.cache.cached(`${this.type}.pages.${uuid}`, ttl, () =>
			ApiClient.pages({ uuid: uuid })
				.then(it => ({
					id: uuid,
					title: it.title,
					sectionId: sectionsId,
					items: it.slice()
				}))
		);
	}

	byConcept (uuid, title, ttl = 60) {
		return this.cache.cached(`${this.type}.byconcept.${uuid}`, ttl, () =>
			ApiClient.contentAnnotatedBy({ uuid: uuid })
				.then(ids => ({
					title: title,
					conceptId: uuid,
					sectionId: null,
					items: ids.slice()
				}))
		);
	}

	search (termName, termValue, opts, ttl = 60 * 10) {
		const searchOpts = {
			filter: {
				bool: {
					must: {
						term: {
							[termName]: termValue
						}
					}
				}
			}
		};
		return this.cache.cached(`${this.type}.search.${termName}:${termValue}`, ttl, () =>
				ApiClient.search(searchOpts)
			)
			.then(filterContent(opts, resolveContentType));
	}

	content (uuids, opts = {}, ttl = 60) {
		const cacheKey = `${this.type}.content.${Array.isArray(uuids) ? uuids.join('_') : uuids}`;
		return this.cache.cached(cacheKey, ttl, () =>
				ApiClient.content({
					uuid: uuids,
					index: 'v3_api_v2'
				})
			)
			.then(filterContent(opts, resolveContentType))
	}

	list (uuid, ttl = 60) {
		return this.cache.cached(`${this.type}.lists.${uuid}`, ttl, () => {
			const headers = { Authorization: process.env.LIST_API_AUTHORIZATION };
			return fetch(`https://prod-up-read.ft.com/lists/${uuid}`, { headers })
				.then(response => {
					if (!response.ok) {
						logger.warn('Failed getting List response', {
							uuid: uuid,
							status: response.status
						});
					}
					return response;
				})
				.then(fetchresJson);
		});
	}

	things (uuids, type = 'idV1', ttl = 60 * 10) {
		const cacheKey = `${this.type}.things.${type}.${Array.isArray(uuids) ? uuids.join('_') : uuids}`;
		return this.cache.cached(cacheKey, ttl, () =>
			ApiClient.things({
				identifierValues: uuids,
				identifierType: type,
				authority: 'http://api.ft.com/system/FT-TME'
			})
		);
	}
}
