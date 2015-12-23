import pages from '../fixtures/pages';
import byConcept from '../fixtures/by-concept';
import searches from '../fixtures/searches';
import lists from '../fixtures/lists';
import content from '../fixtures/content/index';

import { logger } from 'ft-next-express';

import filterContent from '../helpers/filter-content';
import resolveContentType from '../helpers/resolve-content-type';

class MockCAPI {
	constructor(realBackend) {
		this.realBackend = realBackend;
	}

	page(uuid, sectionsId, ttl = 50) {

		if(pages[uuid]) {
			return Promise.resolve(pages[uuid])
		}

		return this.realBackend.page(uuid, ttl)
		.then(it => {
			const resp = { title: it.title, items: it.slice() };
			logger.info(`Mock backend asked for a missing page: ${uuid}. Add this to pages.js to use current real response: \n'${uuid}': ${JSON.stringify(resp, null, 2)}`);

			return it;
		});
	}

	byConcept(uuid, ttl = 50) {
		let concept = byConcept[uuid].items;
		concept.title = pages[uuid].title;

		if(concept) {
			return Promise.resolve(concept);
		}

		return this.realBackend.byConcept(uuid, ttl)
		.then(it => {
			const resp = { title: it.title, items: it.slice() };

			logger.info(`Mock backend asked for a missing content by concept: ${uuid}. Add this to by-concept.js to use current real response: \n'${uuid}': ${JSON.stringify(resp, null, 2)}`);
			return it;
		});
	}

	search(query, ttl = 50) {
		const search = searches[query];

		if(search) { return Promise.resolve(search); }

		return this.realBackend.search(query, ttl)
		.then(it => {
			logger.info(`Mock backend asked for a search: '${query}'. Add this to searches.js to use current real response: \n'${query}': ${JSON.stringify(it, null, 2)}`);
			return it;
		});
	}

	list(uuid, opts) {
		let list = lists[uuid];
		console.log('')
		if (list) {
			return Promise.resolve(list);
		}

		return this.realBackend.list(uuid, opts)
			.then(it => {
				logger.info(`Mock backend asked for a list: '${uuid}'. Add this to lists.js to use current real response: \n'${uuid}': ${JSON.stringify(it, null, 2)}`);
				return it;
			});
	}

	// Content endpoints are not mocked because the responses are massive.

	content(uuids, opts) {
		let filter = (it) => it;
		let mockContent = [];
		let realUuids = [];
		uuids.forEach(uuid => {
			if(content[uuid]) {
				mockContent.push(Promise.resolve(content[uuid]));
				// filter = filterContent(opts, resolveContentType);
			} else {
				realUuids.push(uuid);
			}
		});
		return Promise.all(Promise.all(mockContent), this.realBackend.content(realUuids))
		.then(([mock, real]) => {
			console.log('mock', mock);
			console.log('real', real);
			return real.concat(filterContent(opts, resolveContentType))
		});
	}

	contentv2(uuids, opts) {
		return this.realBackend.contentv2(uuids, opts);
	}
}

export default MockCAPI;
