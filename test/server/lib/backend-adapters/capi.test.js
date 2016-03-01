import realFetch from 'isomorphic-fetch';
global.fetch = realFetch;

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
chai.use(chaiAsPromised);
const expect = chai.expect;

import contentFixture from './../fixtures/content';
import listFixture from './../fixtures/list';

import ApiClient from 'next-ft-api-client';
import Cache from '../../../../server/lib/cache';
import CAPI from '../../../../server/lib/backend-adapters/capi';



describe('CAPI backend', () => {
	describe('#content', () => {
		const cache = new Cache(10);
		const testCAPIBackend = new CAPI(cache, {});
		let stubAPI;

		before(() => {
			stubAPI = sinon.stub(ApiClient, 'content', (opts) => {
				if(opts.uuid.indexOf('invalid') > -1) {
					return Promise.reject('Fetch failed');
				}
				return Promise.resolve(contentFixture);
			});

		});

		afterEach(() => {
			stubAPI.reset();
			Object.keys(cache.contentCache).forEach(key => cache.clear(key));
		});

		after(() => {
			stubAPI.restore();
		});

		it('fetches stories', () => {
			const stories = testCAPIBackend.content(['valid', 'another-valid'], {});

			return stories.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(it.length).to.eq(3);
			});
		});

		it('handles bad responses from CAPI', () => {
			const stories = testCAPIBackend.content(['valid', 'invalid', 'another-valid'], {});

			return stories.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(Array.isArray(it)).to.be.true;
				expect(it.length).to.equal(0);
			});
		});


		it('caching - [a,b, c], [a,b,c] makes no requests the second time round ', () => {
			const firstBatch = testCAPIBackend.content(['a', 'b', 'c'], {});
			return firstBatch.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(stubAPI.args[0][0].uuid).to.eql(['a', 'b', 'c']);
				expect(it.length).to.eq(3);
				expect(it[0].metadata.find(metadata => metadata.taxonomy === 'genre').prefLabel).to.eq('Analysis');
				expect(it[1].metadata.find(metadata => metadata.taxonomy === 'genre').prefLabel).to.eq('Market Report');
				const secondBatch = testCAPIBackend.content(['a', 'b', 'c'], {});

				return secondBatch.then((it) => {
					expect(stubAPI.callCount).to.eq(1);
					expect(it.length).to.eq(3);
					expect(it[0].metadata.find(metadata => metadata.taxonomy === 'genre').prefLabel).to.eq('Analysis');
					expect(it[1].metadata.find(metadata => metadata.taxonomy === 'genre').prefLabel).to.eq('Market Report');
				});
			});
		});

		it('caching - [a,b,c], [b,c,d] makes a fetch the second time round', () => {
			const firstBatch = testCAPIBackend.content(['a', 'b', 'c'], {});
			return firstBatch.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(stubAPI.args[0][0].uuid).to.eql(['a', 'b', 'c']);
				expect(it.length).to.eq(3);
				expect(it[0].metadata.find(metadata => metadata.taxonomy === 'genre').prefLabel).to.eq('Analysis');
				expect(it[1].metadata.find(metadata => metadata.taxonomy === 'genre').prefLabel).to.eq('Market Report');
				const secondBatch = testCAPIBackend.content(['b', 'c', 'd'], {});

				return secondBatch.then((it) => {
					expect(stubAPI.callCount).to.eq(2);
					expect(stubAPI.args[1][0].uuid).to.eql(['b', 'c', 'd']);
					expect(it.length).to.eq(3);
					expect(it[0].metadata.find(metadata => metadata.taxonomy === 'genre').prefLabel).to.eq('Analysis');
					expect(it[1].metadata.find(metadata => metadata.taxonomy === 'genre').prefLabel).to.eq('Market Report');
				});
			});
		});



	});


	describe('#list', () => {
		const cache = new Cache(10);
		const testBackend = new CAPI(cache, {});
		let stubAPI;

		before(() => {
			stubAPI = sinon.stub(ApiClient, 'lists', (opts) => {
				if(opts.uuid.indexOf('invalid') > -1) {
					return Promise.reject('Fetch failed');
				}
				return Promise.resolve(listFixture);
			});
		});

		afterEach(() => {
			stubAPI.restore();
			Object.keys(cache.contentCache).forEach(key => cache.clear(key));
		});
		it('fetches list', () => {
			const stories = testBackend.list('73667f46-1a55-11e5-a130-2e7db721f996', {});

			return stories.then((it) => {
				expect(it.items.length).to.eq(11);
			});
		});
	});

});
