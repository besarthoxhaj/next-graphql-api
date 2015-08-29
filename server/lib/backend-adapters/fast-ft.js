import ApiClient from 'next-ft-api-client';

// FIXME sources shouldn't be necessary here
// we should be able to pass the fastFT uuid from the top
import sources from '../config/sources';

// Polls for changes on the notification api to determine whether a fetch should
// be made for new content. Hopefully this is a little nicer to the content api
// polling it directly.

class FastFtFeed {
	constructor(elasticSearch, source) {
		this.elasticSearch = elasticSearch;
		this.type = (elasticSearch ? 'elasticsearch' : 'capi');
		this.source = source;

		// in-memory content cache
		this.contentCache = {};
		this.since = new Date().toISOString();
		this.fetchFastFt();
		this.pollUpdates();
	}

	fetchFastFt() {
		const {uuid} = this.source;
		return ApiClient.contentAnnotatedBy({
			uuid: uuid,
			useElasticSearch: this.elasticSearch
		})
		.then(ids => {
			this.contentCache = {
				title: 'fastFt',
				conceptId: uuid,
				sectionId: null,
				items: ids.slice()
			};
			return this.contentCache;
		}).catch(console.error);
	}

	pollUpdates() {
		this.poller = setInterval(() => {
			this.hasNewUpdates()
			.then(hasNewUpdates => {
				if(hasNewUpdates) {
					this.fetchFastFt();
					this.since = new Date().toISOString();
				}
			})
			.catch(console.error);
		}, 25 * 1000);
	}
	// Requests a list of notifications for FastFT to determine whether there are
	// any new items.
	hasNewUpdates() {
		const url = `http://api.ft.com/content/notifications?since=${this.since}&apiKey=${process.env.FAST_FT_KEY}`;
		return fetch(url)
			.then(res => res.json())
			.then(json => !!json.notifications.length)
			.catch(console.error);
	}

	// FIXME take uuid as an argument
	fetch() {	return this.contentCache; }
}

const esBackend = new FastFtFeed(true, sources.fastFt);
const capiBackend = new FastFtFeed(false, sources.fastFt);

export default (elasticSearch) => (elasticSearch ? esBackend : capiBackend);
