import ApiClient from 'next-ft-api-client';
import sliceList from '../helpers/sliceList';

class Hui {
	constructor(cache) {
		this.type = 'hui';
		this.cache = cache;
	}

	content({industry, position, sector, country, from, limit}, ttl = 50) {
		return this.cache.cached(`${this.type}.${industry}.${position}.${sector}.${country}`, ttl, () => {
			return ApiClient.hui({industry, position, sector, country})
				.then(articles => sliceList(articles, {from, limit}));
		});
	}

}

export default Hui;
