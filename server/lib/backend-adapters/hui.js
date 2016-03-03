import ApiClient from 'next-ft-api-client';
import sliceList from '../helpers/slice-list';

export default class {
	constructor (cache) {
		this.type = 'hui';
		this.cache = cache;
	}

	content ({industry, position, sector, country, period='last-1-week', from, limit}, ttl = 50) {
		return this.cache.cached(`${this.type}.content.${industry}.${position}.${sector}.${country}.${period}`, ttl, () => {
			return ApiClient.hui({model: 'content', industry, position, sector, country, period})
				.then(articles => sliceList(articles, {from, limit}));
		});
	}

	topics ({industry, position, sector, country, period='last-1-week'}, ttl = 50) {
		return this.cache.cached(`${this.type}.topics.${industry}.${position}.${sector}.${country}.${period}`, ttl, () => {
			return ApiClient.hui({model: 'annotations', industry, position, sector, country, period});
		});
	}

}
