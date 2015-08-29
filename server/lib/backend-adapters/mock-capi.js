import pages from '../fixtures/pages';
import byConcept from '../fixtures/by-concept';
import searches from '../fixtures/searches';

class MockCAPI {
	constructor(realBackend) {
		this.realBackend = realBackend;
	}

	page(uuid, sectionsId, ttl = 50) {
		let page = pages[uuid].items;
		page.title = pages[uuid].title;

		if(page) {
			return Promise.resolve(page);
		}

		return this.realBackend.page(uuid, ttl)
		.then(it => {
			const resp = { title: it.title, items: it.slice() };
			console.log(`Mock backend asked for a missing page: ${uuid}. Add this to pages.js to use current real response: \n'${uuid}': ${JSON.stringify(resp, null, 2)}`);

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

			console.log(`Mock backend asked for a missing content by concept: ${uuid}. Add this to by-concept.js to use current real response: \n'${uuid}': ${JSON.stringify(resp, null, 2)}`);
			return it;
		});
	}

	search(query, ttl = 50) {
		const search = searches[query];

		if(search) { return Promise.resolve(search); }

		return this.realBackend.search(query, ttl)
		.then(it => {
			console.log(`Mock backend asked for a search: '${query}'. Add this to searches.js to use current real response: \n'${query}': ${JSON.stringify(it, null, 2)}`);
			return it;
		});
	}

	// Content endpoints are not mocked because the responses are massive.

	contentv1(uuids, opts) {
		return this.realBackend.contentv1(uuids, opts);
	}

	contentv2(uuids, opts) {
		return this.realBackend.contentv2(uuids, opts);
	}
}

export default MockCAPI;
