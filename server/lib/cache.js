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
			metrics.histogram('cacher.size', JSON.stringify(this.contentCache).length);
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
		// we don't have fresh data, fetch it
		const eventualData = this._fetch(key, now, ttl, fetcher);

		// return stale data or promise of fresh data
		if(data) {
			metrics.count(`cacher.${metricsKey}.stale`, 1);
			return Promise.resolve(data);
		} else {
			return eventualData;
		}
	}

	_fetch(key, now, ttl, fetcher) {
		const metricsKey = key.split('.')[0];

		if(this.requestMap[key])
			return this.requestMap[key];

		metrics.count(`cacher.${metricsKey}.fresh`, 1);

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
		.catch((err) => {
			metrics.count(`cacher.${metricsKey}.error`, 1);
			delete this.requestMap[key];
			logger.error(err);
		});
		return this.requestMap[key];
	}
}

export default Cache;
