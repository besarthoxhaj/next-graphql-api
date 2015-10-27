import realFetch from 'isomorphic-fetch';
global.fetch = realFetch;

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
chai.use(chaiAsPromised);
const expect = chai.expect;

import contentv1fixture from './fixtures/contentv1';

import ApiClient from 'next-ft-api-client';
import Cache from '../../../server/lib/cache';
import CAPI from '../../../server/lib/backend-adapters/capi';



describe('CAPI backend', () => {
	describe('#contentv1', () => {
		const cache = new Cache(10);
		const testCAPIBackend = new CAPI(cache, {});
		let stubAPI;

		before(() => {
			stubAPI = sinon.stub(ApiClient, 'contentLegacy', (opts) => {
				if(opts.uuid.includes('invalid')) {
					return Promise.reject('Fetch failed');
				}
				return Promise.resolve(contentv1fixture);
			});
		});

		afterEach(() => {
			stubAPI.reset();
			Object.keys(cache.contentCache).forEach(key => cache.clear(key));
		});

		after(() => {
			stubAPI.restore();
		})

		it('fetches stories', () => {
			const stories = testCAPIBackend.contentv1(['valid', 'another-valid']);

			return stories.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(it.length).to.eq(3);
			});
		});

		it('handles bad responses from CAPI', () => {
			const stories = testCAPIBackend.contentv1(['valid', 'invalid', 'another-valid']);

			return stories.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(it).to.be.undefined;
			});
		});


		it('caching - [a,b, c], [a,b,c] makes no requests the second time round ', () => {
			const firstBatch = testCAPIBackend.contentv1(['a', 'b', 'c']);
			return firstBatch.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(stubAPI.args[0][0].uuid).to.eql(['a', 'b', 'c']);
				expect(it.length).to.eq(3);
				expect(it[0].item.metadata.genre[0].term.name).to.eq('Analysis');
				expect(it[1].item.metadata.genre[0].term.name).to.eq('Market Report');
				const secondBatch = testCAPIBackend.contentv1(['a', 'b', 'c']);

				return secondBatch.then((it) => {
					expect(stubAPI.callCount).to.eq(1);
					expect(it.length).to.eq(3);
					expect(it[0].item.metadata.genre[0].term.name).to.eq('Analysis');
					expect(it[1].item.metadata.genre[0].term.name).to.eq('Market Report');
				});
			});
		});

		it('caching - [a,b,c], [b,c,d] makes a fetch the second time round', () => {
			const firstBatch = testCAPIBackend.contentv1(['a', 'b', 'c']);
			return firstBatch.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(stubAPI.args[0][0].uuid).to.eql(['a', 'b', 'c']);
				expect(it.length).to.eq(3);
				expect(it[0].item.metadata.genre[0].term.name).to.eq('Analysis');
				expect(it[1].item.metadata.genre[0].term.name).to.eq('Market Report');
				const secondBatch = testCAPIBackend.contentv1(['b', 'c', 'd']);

				return secondBatch.then((it) => {
					expect(stubAPI.callCount).to.eq(2);
					expect(stubAPI.args[1][0].uuid).to.eql(['b', 'c', 'd']);
					expect(it.length).to.eq(3);
					expect(it[0].item.metadata.genre[0].term.name).to.eq('Analysis');
					expect(it[1].item.metadata.genre[0].term.name).to.eq('Market Report');
				});
			});
		});



	})
});