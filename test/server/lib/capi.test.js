import realFetch from 'isomorphic-fetch';
global.fetch = realFetch;

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
chai.use(chaiAsPromised);
const expect = chai.expect;

import contentv1fixture from './fixtures/contentv1';
import listfixture from './fixtures/list';

import ApiClient from 'next-ft-api-client';
import Cache from '../../../server/lib/cache';
import CAPI from '../../../server/lib/backend-adapters/capi';



describe.only('CAPI backend', () => {
	describe('#contentv1', () => {
		const cache = new Cache(10);
		const testCAPIBackend = new CAPI(cache, {});
		let stubAPI;

		before(() => {
			stubAPI = sinon.stub(ApiClient, 'contentLegacy', (opts) => {
				console.log(opts)
				return Promise.resolve(opts.uuid.map((uuid) => {
					switch(uuid) {
						case 'valid':
							return contentv1fixture[0];
						case 'invalid':
							return null;
						case 'another-valid':
							return contentv1fixture[1];
						default:
							return contentv1fixture[2];
						}
				}));
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
				expect(it.length).to.eq(2);
			});
		});

		it('handles bad responses from CAPI', () => {
			const stories = testCAPIBackend.contentv1(['valid', 'invalid', 'another-valid']);

			return stories.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(it.length).to.eq(2);
			});
		});


		it('caching - [a,b], [a,b] makes no requests the second time round ', () => {
			const firstBatch = testCAPIBackend.contentv1(['valid', 'another-valid']);
			return firstBatch.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(stubAPI.args[0][0].uuid).to.eql(['valid', 'another-valid']);
				expect(it.length).to.eq(2);
				expect(it[0].item.metadata.genre[0].term.name).to.eq('Analysis');
				expect(it[1].item.metadata.genre[0].term.name).to.eq('Market Report');
				const secondBatch = testCAPIBackend.contentv1(['valid', 'another-valid']);

				return secondBatch.then((it) => {
					expect(stubAPI.callCount).to.eq(1);
					expect(it.length).to.eq(2);
				expect(it[0].item.metadata.genre[0].term.name).to.eq('Analysis');
				expect(it[1].item.metadata.genre[0].term.name).to.eq('Market Report');
				});
			});
		});
		it('caching - [a,b], [b,c] only fetches c the second time round', () => {
			const firstBatch = testCAPIBackend.contentv1(['valid', 'another-valid']);
			return firstBatch.then((it) => {
				expect(stubAPI.callCount).to.eq(1);
				expect(stubAPI.args[0][0].uuid).to.eql(['valid', 'another-valid']);
				expect(it.length).to.eq(2);
				expect(it[0].item.metadata.genre[0].term.name).to.eq('Analysis');
				expect(it[1].item.metadata.genre[0].term.name).to.eq('Market Report');
				const secondBatch = testCAPIBackend.contentv1(['another-valid', 'valid-3']);

				return secondBatch.then((it) => {
					expect(stubAPI.callCount).to.eq(2);
					expect(stubAPI.args[1][0].uuid).to.eql(['valid-3']);
					expect(it.length).to.eq(2);
					expect(it[0].item.metadata.genre[0].term.name).to.eq('Market Report');
					expect(it[1].item.metadata.genre[0].term.name).to.eq('Comment');
				});
			});
		});



	})
});
