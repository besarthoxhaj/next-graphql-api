import Cache from './cache';

import FastFtFeed from './backend-adapters/fast-ft';
import CAPI from './backend-adapters/capi';
import Popular from './backend-adapters/popular';
import Liveblog from './backend-adapters/liveblog';
import Playlist from './backend-adapters/playlist';

import MockCAPI from './backend-adapters/mock-capi';
import MockLiveblog from './backend-adapters/mock-liveblog';

import articleGenres from 'ft-next-article-genre';

// internal content filtering logic shared for ContentV1 and ContentV2
const filterContent = ({from, limit, genres, type}, resolveType) => {
	return (items) => {
		if(genres && genres.length) {
			items = items.filter(it => genres.indexOf(articleGenres(it.item.metadata)) > -1);
		}

		if(type) {
			if(type === 'liveblog') {
				items = items.filter(it => resolveType(it) === 'liveblog');
			} else {
				items = items.filter(it => resolveType(it) !== 'liveblog');
			}
		}

		items = (from ? items.slice(from) : items);
		items = (limit ? items.slice(0, limit) : items);

		return items;
	};
};

class Backend {
	constructor(adapters, type) {
		this.adapters = adapters;
		this.type = type;
	}

	page(uuid, sectionsId, ttl = 50) {
		return this.adapters.capi.page(uuid, ttl)
		.then(it => ({
			id: uuid,
			title: it.title,
			sectionId: sectionsId,
			items: it.slice()
		}))
		.catch(e => console.log(e));
	}

	byConcept(uuid, title, ttl = 50) {
		return this.adapters.capi.contentAnnotatedBy(uuid, ttl)
		.then(ids => ({
			title: title,
			conceptId: uuid,
			sectionId: null,
			items: ids.slice()
		}));
	}

	search(query, ttl = 50) {
		return this.adapters.capi.search(query, ttl);
	}

	contentv1(uuids, opts) {
		return this.adapters.capi.contentv1(uuids)
		.then(filterContent(opts, this.resolveContentType));
	}

	contentv2(uuids, opts) {
		return this.adapters.capi.contentv2(uuids)
		.then(filterContent(opts, this.resolveContentType));
	}

	popular(url, title, ttl = 50) {
		return this.adapters.popular.fetch(url, ttl)
		.then((data) => {
			return data.mostRead.pages.map(function (page) {
				var index = page.url.lastIndexOf('/');
				var id = page.url.substr(index + 1).replace('.html', '');
				return id;
			});
		})
		.then((ids) => ({
			id: null,
			sectionId: null,
			title: title,
			items: ids
		}));
	}

	liveblogExtras(uri, {limit}, ttl = 50) {
		return this.adapters.liveblog.fetch(uri, ttl)
		.then(json => {
			const dated = json.filter(it => !!it.data.datemodified);
			const [first, second] = dated.slice(0, 2);

			// make sure updates are in order from latest to earliest
			if((first && first.data.datemodified) < (second && second.data.datemodified)) { json.reverse(); }

			// dedupe updates and only keep messages, decide on status
			let [_, updates, status] = json.reduce(([skip, updates, status], event) => {
				if (event.event === 'end') { return [skip, updates, 'closed']; }

				if (event.event === 'msg' && event.data.mid && !skip[event.data.mid]) {
					updates.push(event);
					skip[event.data.mid] = true;
					status = status || 'inprogress';
				}

				return [skip, updates, status];
			}, [{}, [], null]);

			if(limit) { updates = updates.slice(0, limit); }

			status = status || 'comingsoon';
			return {updates, status};
		});
	}

	fastFT() {
		return this.adapters.fastFT.fetch();
	}

	resolveContentType(value) {
		if (value.item && !!value.item.location.uri.match(/liveblog|marketslive|liveqa/i)) {
			return 'liveblog';
		} else if (value.item) {
			return 'contentv1';
		} else {
			return 'contentv2';
		}
	}

	videos(id, ttl = 50) {
		return this.adapters.videos.fetch(id, ttl);
	}
}

// Assemble the beast

const memCache = new Cache(10 * 60);

// Adapters
const esFastFT = new FastFtFeed(true);
const capiFastFT = new FastFtFeed(false);

const esCAPI = new CAPI(true, memCache);
const directCAPI = new CAPI(false, memCache);

const popular = new Popular(memCache);

const playlist = new Playlist(memCache);

const liveblog = new Liveblog(memCache);

// Mock Adapters
const mockedCAPI = new MockCAPI(esCAPI);
const mockLiveblog = new MockLiveblog(liveblog);

// Elasticsearch & direct CAPI Backends
const esBackend = new Backend({fastFT: esFastFT, capi: esCAPI, popular: popular, liveblog: liveblog, videos: playlist}, 'elasticsearch');
const capiBackend = new Backend({fastFT: capiFastFT, capi: directCAPI, popular: popular, liveblog: liveblog, videos: playlist}, 'direct');

// Mock backend
const mockBackend = new Backend({fastFT: esFastFT, capi: mockedCAPI, popular: popular, liveblog: mockLiveblog, videos: playlist});

export default (elasticSearch, mock) => {
	return (mock ? mockBackend : (elasticSearch ? esBackend : capiBackend));
};
