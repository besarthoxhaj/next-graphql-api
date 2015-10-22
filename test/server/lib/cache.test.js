import fetch from 'isomorphic-fetch';
global.fetch = fetch;

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import Cache from '../../../server/lib/cache';


describe('GraphQL Cache', () => {
	const cache = new Cache(10);


	describe('#cached', () => {
		const fetcher = () => {
			return Promise.resolve('fresh');
		};
		const fail = () => {
			return Promise.reject('OMG');
		};

		it('fetches fresh data when nothing is cached', () => {
			expect(cache.cached('test-key-1', 1, fetcher)).to.eventually.eq('fresh');
		});

		it('returns cached data when fresh', () => {
			return cache.cached('test-key-2', 10, () => Promise.resolve('orig'))
			.then(() => {
				return cache.cached('test-key-2', 10, fetcher)
			})
			.then((it) => {
				expect(it).to.eq('orig');
			});
		});

		it('returns stale data when expired', () => {
			return cache.cached('test-key-3', -1, () => Promise.resolve('stale'))
			.then(() => {
				return cache.cached('test-key-3', 10, fetcher);
			})
			.then((it) => {
				expect(it).to.eq('stale')
			})
		});

		it('fetches new data when cache expires', () => {
			return cache.cached('test-key-4', -10, () => Promise.resolve('stale'))
			.then(() => {
				return cache.cached('test-key-4', 10, fetcher);
			})
			.then((it) => {
				expect(it).to.eq('stale');
				return cache.cached('test-key-4', 10, () => Promise.resolve('too fresh'));
			})
			.then((it) => {
				expect(it).to.eq('fresh');
			})
		});

		it('only fetches new data once at a time when cache expires', () => {
			let p1 = cache.cached('test-key-5', 10, fetcher);
			let p2 = cache.cached('test-key-5', 10, fetcher);

			// both should be the same promise
			expect(p1).to.eq(p2);
		});

		it('clean up finished and failed fetches', () => {
			let p3 = null;
			let p1 = cache.cached('test-key-6', -1, fail)

			return p1.then(() => {
				let p2 = cache.cached('test-key-6', -1, fetcher)

				return p2.then(() => {
					cache.clear('test-key-6');
					p3 = cache.cached('test-key-6', 10, fetcher);

					// now they shouldn't be the same promise
					expect(p1).to.not.equal(p2);
					expect(p1).to.not.equal(p3);
					expect(p2).to.not.equal(p3);
				})
			});
		});
	});


	describe('#cachedList', () => {
		const fetcher = () => {
			return Promise.resolve(['fresh', 'more-fresh']);
		};
		const fail = () => {
			return Promise.reject('OMG');
		};

		it('fetches fresh data when nothing is cached', () => {
			expect(cache.cachedList('test-key-1', [1,2], 10, fetcher)).to.eventually.eql(['fresh', 'more-fresh']);
		});

		it('returns cached data when fresh', () => {
			return cache.cachedList('test-key-2', [1,2], 10, () => Promise.resolve(['orig1', 'orig2']))
			.then(() => {
				return cache.cachedList('test-key-2', [1,2], 10, fetcher)
			})
			.then((it) => {
				expect(it).to.eql(['orig1', 'orig2']);
			});
		});

		it('[1,2], [2,3] only fetches 3 the second time round', () => {
			return cache.cachedList('test-key-3', [1,2], 10, () => Promise.resolve(['orig1', 'orig2']))
			.then(() => {
				return cache.cachedList('test-key-3', [2,3], 10, () => Promise.resolve(['fresh3']))
			})
			.then((it) => {
				expect(it).to.eql(['orig2', 'fresh3']);
			});
		});

		it('returns stale data when expired', () => {
			return cache.cachedList('test-key-4', [1,2], -1, () => Promise.resolve(['stale1', 'stale2']))
			.then(() => {
				return cache.cachedList('test-key-4', [2,3], 10, () => Promise.resolve(['fresh3']));
			})
			.then((it) => {
				expect(it).to.eql(['stale2', 'fresh3']);
			})
		});

		it('fetches new data when cache expires', () => {
			return cache.cachedList('test-key-5', [1,2], -10, () => Promise.resolve(['stale1', 'stale2']))
			.then(() => {
				return cache.cachedList('test-key-5', [1,2], 10, fetcher);
			})
			.then((it) => {
				expect(it).to.eql(['stale1', 'stale2']);
				return cache.cachedList('test-key-5', [1,2], 10, () => Promise.resolve(['too fresh 1', 'too fresh 2']));
			})
			.then((it) => {
				expect(it).to.eql(['fresh', 'more-fresh']);
			})
		});

		it('only fetches new data once at a time when cache expires', () => {
			let p1 = cache.cachedList('test-key-6', [1,2], 10, fetcher);
			let p2 = cache.cachedList('test-key-6', [1,2], 10, fetcher);
			// both should be the same promise
			expect(p1).to.eql(p2);
		});

		it('clean up finished and failed fetches', () => {
			let p3 = null;
			let p1 = cache.cachedList('test-key-6', [1,2], -1, fail)

			return p1.then(() => {
				let p2 = cache.cachedList('test-key-6', [2,3], -1, fetcher)

				return p2.then(() => {
					cache.clear('test-key-6.1');
					cache.clear('test-key-6.2');
					p3 = cache.cachedList('test-key-6', [1,2], 10, fetcher);

					// now they shouldn't be the same promise
					expect(p1).to.not.equal(p2);
					expect(p1).to.not.equal(p3);
					expect(p2).to.not.equal(p3);
				})
			});
		});
	});
});
