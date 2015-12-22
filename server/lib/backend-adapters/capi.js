import ApiClient from 'next-ft-api-client';
import articleGenres from 'ft-next-article-genre';
import sliceList from '../helpers/sliceList';


const resolveContentType = (value) => {
	if (/liveblog|marketslive|liveqa/i.test(value.webUrl)) {
		return 'liveblog';
	} else {
		return 'article';
	}
}

// internal content filtering logic shared for ContentV1 and ContentV2
const filterContent = ({from, limit, genres, type}, resolveType) => {
	return (items = []) => {
		if (genres && genres.length) {
			items = items.filter(item => genres.indexOf(articleGenres(capifyMetadata(item.metadata), {requestedProp: 'editorialTone'})) > -1);
		}

		if (type) {
			if(type === 'liveblog') {
				items = items.filter(it => resolveType(it) === 'liveblog');
			} else {
				items = items.filter(it => resolveType(it) !== 'liveblog');
			}
		}

		return sliceList(items, {from, limit});
	};
};

class CAPI {
	constructor(cache) {
		this.type = 'capi';
		this.cache = cache;
	}

	page(uuid, ttl = 50) {
		return this.cache.cached(`${this.type}.pages.${uuid}`, ttl, () => {
			return ApiClient.pages({ uuid: uuid })
				.then(it => ({
					id: uuid,
					title: it.title,
					sectionId: sectionsId,
					items: it.slice()
				}))
				.catch(e => {
					logger.error(`Error getting page ${uuid}`, e)
				});
		});
	}

	byConcept(uuid, ttl = 50) {
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

	search(query, ttl = 50) {
		return this.cache.cached(`${this.type}.search.${query}`, ttl, () => {
			return ApiClient.searchLegacy({ query: query });
		});
	}

	content(uuids, opts, ttl=50) {
		console.log('uuids', uuids);
		console.log('opts', opts);
		const cacheKey = `${this.type}.content.${Array.isArray(uuids) ? uuids.join('_') : uuids}`;
		return this.cache.cached(cacheKey, ttl, () => {
			return ApiClient.content({
				uuid: uuids,
				index: 'v3_api_v2'
			})
			.then(filterContent(opts, resolveContentType));

		});
	}

	list(uuid, ttl = 50) {
		// NOTE: for now, list api is bronze, so handle errors
		return this.cache.cached(`${this.type}.lists.${uuid}`, ttl, () => {
			return ApiClient.lists({ uuid: uuid })
			// return 'fake' list, so Collection can resolveType correctly
			.catch(() => ({ apiUrl: `http://api.ft.com/lists/${uuid}` }));
		});
	}
}

export default CAPI;
