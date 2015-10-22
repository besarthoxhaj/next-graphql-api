import { metrics, logger } from 'ft-next-express';

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
		const metricsKey = key.split('.')[0];
		const cache = this.contentCache;

		const data = (cache[key] && cache[key].data);
		const expire = (cache[key] && cache[key].expire);
		const now = (new Date().getTime()) / 1000;

		// we have fresh data
		if(expire > now && data) {
			metrics.count(`cacher.${metricsKey}.cached`, 1);
			return Promise.resolve(data);
		}
		// we don't have fresh data, fetch it and cache it
		const eventualData = this._fetch(key, null, now, ttl, fetcher);

		// return stale data or promise of fresh data
		if(data) {
			metrics.count(`cacher.${metricsKey}.stale`, 1);
			return Promise.resolve(data);
		} else {
			return eventualData;
		}
	}

	// Caching for lists. For a given list of IDs, cache the IDs individually, but fetch in a batch
	// when cache expires return stale data immediately and fetches fresh one
	cachedList(listKey, ids, ttl, batchFetcher) {
		const promises = new Map();
		const itemsToFetch = [];
		const itemsToWaitFor = [];
		const cache = this.contentCache;
		const now = (new Date().getTime()) / 1000;
		let eventualData;

		ids.forEach((id) => {
			let itemCacheKey = `${listKey}.${id}`;
			let data = cache[itemCacheKey] && cache[itemCacheKey].data;
			let expire = cache[itemCacheKey] && cache[itemCacheKey].expire;
			if(expire > now && data) {
				//we have fresh data
				promises.set(id, data);
			} else {
				itemsToFetch.push(id);
				if(data) {
					promises.set(id, data);
				} else {
					promises.set(id, null);
					itemsToWaitFor.push(id);
				}
			}
		});

		if(itemsToFetch.length) {

			eventualData =
				this._fetch(listKey, itemsToFetch, now, ttl, batchFetcher)
				.then((items) => {
					if(items) {
						items.forEach((item, index) => {
							promises.set(itemsToWaitFor[index], item);
						});
					}
					return [...promises.values()];
				})
		}

		if(itemsToWaitFor.length) {
			return eventualData;
		} else {
			return Promise.resolve([...promises.values()]);
		}

	}

	_fetch(key, ids, now, ttl, fetcher) {
		const requestKey = ids && ids.length ? `${key}.${ids.join('_')}` : key;
		const metricsKey = key.split('.')[0];
		const expireTime = now + ttl;
		if(this.requestMap[requestKey])
			return this.requestMap[requestKey];

		metrics.count(`cacher.${metricsKey}.fresh`, 1);

		this.requestMap[requestKey] = fetcher(ids)
		.then((it) => {
			if(ids && ids.length) {
				it.forEach((item, index) => {
					let itemCacheKey = `${key}.${ids[index]}`;
					if(item) {
						this.contentCache[itemCacheKey] = {
							expire: expireTime,
							data: item
						};
					}
				});
			} else {
				this.contentCache[key] = {
					expire: expireTime,
					data: it
				};
			}

			delete this.requestMap[requestKey];
			return it;
		})
		.catch((err) => {
			metrics.count(`cacher.${metricsKey}.error`, 1);
			logger.error(err);
			delete this.requestMap[requestKey];
		});
		return this.requestMap[requestKey];
	}
}

export default Cache;
