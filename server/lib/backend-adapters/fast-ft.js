import ApiClient from 'next-ft-api-client';
import { captureError } from 'express-errors-handler';

// FIXME sources shouldn't be necessary here
// we should be able to pass the fastFT uuid from the top
import sources from '../../config/sources';

// Polls for changes on the notification api to determine whether a fetch should
// be made for new content. Hopefully this is a little nicer to the content api
// polling it directly.

class FastFtFeed {
	constructor(source) {
		this.type = 'capi';
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
			uuid: uuid
		})
		.then(ids => {
			this.contentCache = {
				title: 'fastFt',
				conceptId: uuid,
				sectionId: null,
				items: ids.slice()
			};
			return this.contentCache;
		}).catch(captureError);
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
			.catch(captureError);
		}, 25 * 1000);
	}
	// Requests a list of notifications for FastFT to determine whether there are
	// any new items.
	hasNewUpdates() {
		const url = `http://api.ft.com/content/notifications?since=${this.since}&apiKey=${process.env.FAST_FT_KEY}`;
		return fetch(url)
			.then(res => res.json())
			.then(json => !!json.notifications.length)
			.catch(captureError);
	}

	// FIXME take uuid as an argument
	fetch() {	return this.contentCache; }
}

const backend = new FastFtFeed(sources.fastFt);

export default () => backend;
