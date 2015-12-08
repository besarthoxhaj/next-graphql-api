import ApiClient from 'next-ft-api-client';

class Hui {
	constructor(cache) {
		this.type = 'hui';
		this.cache = cache;
	}

	content({industry, position, sector, country}, ttl = 50) {
		return this.cache.cached(`${this.type}.${industry}.${position}.${sector}.${country}`, ttl, () => {
			return ApiClient.hui({industry, position, sector, country});
		});
	}

}

export default Hui;
