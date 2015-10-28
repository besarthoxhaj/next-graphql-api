import fetch from 'isomorphic-fetch';
global.fetch = fetch;

import chai from 'chai';
import sinon from 'sinon';

import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import Cache from '../../../server/lib/cache';


describe('GraphQL Cache', () => {
	const cache = new Cache(10);
	const fetcher = () => {
		return Promise.resolve('fresh');
	};
	const fail = () => {
		return Promise.reject('OMG');
	};


	describe('#cached', () => {
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


	it('cleans up cache items stale items and unused stale items seperately', () => {
		const clock = sinon.useFakeTimers();
		const cache = new Cache(10 * 60, 5 * 60);


		const p1 = cache.cached('test-key-1', 1, fetcher);
		const p2 = cache.cached('test-key-unused', 1, fetcher);
		return Promise.all([p1,p2]).then(() => {

			//After two minutes, both are still valid so remain in cache
			clock.tick(1000 * 60 * 2);
			expect(cache.contentCache['test-key-1']).to.exist;
			expect(cache.contentCache['test-key-unused']).to.exist;

			clock.tick(1000 * 60 * 2);
			//Rerequest test-key-1 so it remains fresh
			cache.cached('test-key-1', Date.now() + 50, fetcher);

			clock.tick(1000 * 60 * 2);
			expect(cache.contentCache['test-key-1']).to.exist;
			expect(cache.contentCache['test-key-unused']).to.be.undefined;

			clock.tick(1000 * 60 * 5);
			expect(cache.contentCache['test-key-1']).to.be.undefined;
			expect(cache.contentCache['test-key-unused']).to.be.undefined;
		});

	});
});
