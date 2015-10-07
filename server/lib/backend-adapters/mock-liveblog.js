import liveblogs from '../fixtures/liveblogs';
import { logger } from 'ft-next-express';

class MockLiveblog {
	constructor(realBackend) {
		this.realBackend = realBackend;
	}

	fetch(uri, ttl = 50) {
		const liveblog = liveblogs[uri];

		if(liveblog) {
			return Promise.resolve(liveblog);
		}

		return this.realBackend.fetch(uri, ttl)
		.then(json => {
			logger.info(`Mock backend asked for live updates for blog: ${uri}. Add this to liveblogs.js to use current real response: \n'${uri}': ${JSON.stringify(json, null, 2)}`);
			return json;
		});
	}
}

export default MockLiveblog;
