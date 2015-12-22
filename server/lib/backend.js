import { logger } from 'ft-next-express';

import Cache from './cache';

import FastFtFeed from './backend-adapters/fast-ft';
import CAPI from './backend-adapters/capi';
import Hui from './backend-adapters/hui';
import Popular from './backend-adapters/popular';
import Liveblog from './backend-adapters/liveblog';
import Video from './backend-adapters/video';
import PopularAPI from './backend-adapters/popular-api';
import Myft from './backend-adapters/myft';

import sources from '../config/sources';

import MockCAPI from './backend-adapters/mock-capi';
import MockLiveblog from './backend-adapters/mock-liveblog';

import capifyMetadata from './helpers/capifyMetadata';

class Backend {
	constructor(adapters, type) {
		this.adapters = adapters;
		this.type = type;
	}

	page(uuid, sectionsId, ttl = 50) {
		return this.adapters.capi.page(uuid, sectionsId, ttl);
	}

	byConcept(uuid, title, ttl = 50) {
		return this.adapters.capi.contentAnnotatedBy(uuid, title, ttl)
	}

	search(query, ttl = 50) {
		return this.adapters.capi.search(query, ttl);
	}

	content(uuids, opts) {
		return this.adapters.capi.content(uuids, opts);
	}

	popular(url, title, ttl = 50) {
		return this.adapters.popular.fetch(url, title, ttl);
	}

	liveblogExtras(uri, {limit}, ttl = 50) {
		return this.adapters.liveblog.fetch(uri, {limit}, ttl);
	}

	fastFT() {
		return this.adapters.fastFT.fetch();
	}


	videos(id, {from, limit}, ttl = 50) {
		return this.adapters.video.playlist(id,{from, limit}, ttl);

	}

	list(uuid, ttl = 50) {
		return this.adapters.capi.list(uuid, ttl);
	}

	popularTopics({from, limit}, ttl = 50) {
		return this.adapters.popularApi.topics({from, limit}, ttl)
	}

	popularArticles(args, ttl = 50) {
		return this.adapters.popularApi.articles(args, ttl)

	}

	popularFromHui(args, ttl = 50) {
		return this.adapters.hui.content(args, ttl)

	}

	userSavedContent(args, ttl = -1) {
		return this.adapters.myft.savedContent(args, ttl)

	}

	userFollowedConcepts(args, ttl = -1) {
		return this.adapters.myft.followedConcepts(args, ttl)

	}

	userPersonalisedFeed(args, ttl = -1) {
		return this.adapters.myft.personalisedFeed(args, ttl)

	}
}

// Assemble the beast

// serve stale cache for 12 hours, and 30 minutes for unused items
const memCache = new Cache(12 * 60 * 60, 30 * 60);

// Adapters
const fastFT = new FastFtFeed(sources.fastFt);
const capi = new CAPI(memCache);
const hui = new Hui(memCache);
const popular = new Popular(memCache);
const liveblog = new Liveblog(memCache);
const video = new Video(memCache);
const popularApi = new PopularAPI(memCache);
const myft = new Myft(memCache);

// Mock Adapters
const mockedCAPI = new MockCAPI(capi);
const mockLiveblog = new MockLiveblog(liveblog);

const backend = new Backend({
	fastFT,
	capi,
	hui,
	popular,
	liveblog,
	video,
	popularApi,
	myft
}, 'real');

// Mock backend
const mockBackend = new Backend({
	fastFT,
	capi: mockedCAPI,
	hui,
	popular,
	liveblog: mockLiveblog,
	video,
	popularApi,
	myft
}, 'mocked');

export default {
	Backend: Backend,
	factory: (opts = {}) => opts.mock ? mockBackend : backend
};
