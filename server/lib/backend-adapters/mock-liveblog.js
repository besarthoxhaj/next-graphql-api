import liveblogs from '../fixtures/liveblogs';

export default class {
	constructor (realBackend) {
		this.realBackend = realBackend;
	}

	fetch (uri, opts, ttl = 50) {
		const liveblog = liveblogs[uri];

		return liveblog ?
			Promise.resolve(liveblog).then((json) => this.realBackend.parse(json, opts.limit)) :
			this.realBackend.fetch(uri, ttl);
	}
}
