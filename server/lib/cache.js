import {Promise} from 'es6-promise';

class Cache {
	constructor(staleTtl) {
		// in-memory content cache
		this.contentCache = {};
		this.requestMap = {};

		const sweeper = () => {
			const now = (new Date().getTime()) / 1000;

			for(let key in this.contentCache) {
				if(this.contentCache[key].expire + staleTtl < now) {
					delete this.contentCache[key];
				}
			}
		};

		// keep clearing the cache every minute
		setInterval(sweeper, 60 * 1000);
	}

	clear(key) {
		delete this.contentCache[key];
	}

	// Caching wrapper. Always returns a promise, when cache expires
	// returns stale data immediately and fetches fresh one
	cached(key, ttl, fetcher) {
		const cache = this.contentCache;

		const data = (cache[key] && cache[key].data);
		const expire = (cache[key] && cache[key].expire);
		const now = (new Date().getTime()) / 1000;

		// we have fresh data
		if(expire > now && data) { return Promise.resolve(data); }

		// we don't have fresh data, fetch it
		const eventualData = this._fetch(key, now, ttl, fetcher);

		// return stale data or promise of fresh data
		return (data ? Promise.resolve(data) : eventualData);
	}

	_fetch(key, now, ttl, fetcher) {
		if(this.requestMap[key])
			return this.requestMap[key];

		this.requestMap[key] = fetcher()
		.then((it) => {
			let expireTime = now + ttl;

			this.contentCache[key] = {
				expire: expireTime,
				data: it
			};

			delete this.requestMap[key];

			return it;
		})
		.catch((e) => {
			delete this.requestMap[key];
		});

		return this.requestMap[key];
	}
}

export default Cache;
