import Cache from './cache';

import FastFtFeed from './backend-adapters/fast-ft';
import CAPI from './backend-adapters/capi';
import Hui from './backend-adapters/hui';
import Popular from './backend-adapters/popular';
import Liveblog from './backend-adapters/liveblog';
import Playlist from './backend-adapters/playlist';
import PopularAPI from './backend-adapters/popular-api';

import MockCAPI from './backend-adapters/mock-capi';
import MockLiveblog from './backend-adapters/mock-liveblog';

import articleGenres from 'ft-next-article-genre';
import { logger } from 'ft-next-express';

import capifyMetadata from './helpers/capifyMetadata';

const sliceList = (items, {from, limit}) => {
	items = items || [];
	items = (from ? items.slice(from) : items);
	items = (limit ? items.slice(0, limit) : items);

	return items;
};

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
		.catch(e => {
			logger.error(`Error getting page ${uuid}`, e)
		});
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

	content(uuids, opts) {
		return this.adapters.capi.content(uuids)
			.then(filterContent(opts, this.resolveContentType));
	}

	popular(url, title, ttl = 50) {
		return this.adapters.popular.fetch(url, ttl)
		.then((data) => {
			return data.mostRead.pages.map(function (page) {
				const index = page.url.lastIndexOf('/');
				const id = page.url.substr(index + 1).replace('.html', '');
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
			let [, updates, status] = json.reduce(([skip, updates, status], event) => {
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
		if (/liveblog|marketslive|liveqa/i.test(value.webUrl)) {
			return 'liveblog';
		} else {
			return 'article';
		}
	}

	videos(id, {from, limit}, ttl = 50) {
		return this.adapters.videos.fetch(id, ttl)
			.then(topics => sliceList(topics, {from, limit}));
	}

	list(uuid, ttl = 50) {
		return this.adapters.capi.list(uuid, ttl)
			// return 'fake' list, so Collection can resolveType correctly
			.catch(() => ({ apiUrl: `http://api.ft.com/lists/${uuid}` }));
	}

	popularTopics({from, limit}, ttl = 50) {
		return this.adapters.popularApi.topics(ttl)
		.then(topics => sliceList(topics, {from, limit}));
	}

	popularArticles(args, ttl = 50) {
		return this.adapters.popularApi.articles(ttl)
			.then(articles => sliceList(articles, args));
	}

	popularByIndustry(args, ttl = 50) {
		return this.adapters.hui.content('industry', args.industry, ttl)
			.then(articles => sliceList(articles, args));
	}


}

// Assemble the beast

// serve stale cache for 12 hours, and 30 minutes for unused items
const memCache = new Cache(12 * 60 * 60, 30 * 60);

// Adapters
const fastFT = new FastFtFeed();
const capi = new CAPI(memCache);
const hui = new Hui(memCache);
const popular = new Popular(memCache);
const liveblog = new Liveblog(memCache);
const playlist = new Playlist(memCache);
const popularApi = new PopularAPI(memCache);

// Mock Adapters
const mockedCAPI = new MockCAPI(capi);
const mockLiveblog = new MockLiveblog(liveblog);

const backend = new Backend({
	fastFT: fastFT,
	capi: capi,
	hui: hui,
	popular: popular,
	liveblog: liveblog,
	videos: playlist,
	popularApi: popularApi
}, 'real');

// Mock backend
const mockBackend = new Backend({
	fastFT: fastFT,
	capi: mockedCAPI,
	hui: hui,
	popular: popular,
	liveblog: mockLiveblog,
	videos: playlist,
	popularApi: popularApi
}, 'mocked');

export default {
	Backend: Backend,
	factory: (opts = {}) => opts.mock ? mockBackend : backend
};
