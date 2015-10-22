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


describe('CAPI backend', () => {
	describe('#contentv1', () => {
		const cache = new Cache(10);
		const testCAPIBackend = new CAPI(cache, {});
		let stubAPI;

		before(() => {
			stubAPI = sinon.stub(ApiClient, 'contentLegacy', (opts) => {
				switch(opts.uuid) {
					case 'valid':
						return Promise.resolve(contentv1fixture[0]);
					case 'invalid':
						return Promise.reject('bad response');
					case 'another-valid':
						return Promise.resolve(contentv1fixture[1]);
					default:
						return Promise.resolve(contentv1fixture[2]);
				}
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
				expect(stubAPI.callCount).to.eq(2);
				expect(it.length).to.eq(2);
			});
		});

		it('handles bad responses from CAPI', () => {
			const stories = testCAPIBackend.contentv1(['valid', 'invalid', 'another-valid']);

			return stories.then((it) => {
				expect(stubAPI.callCount).to.eq(3);
				expect(it.length).to.eq(2);
			});
		});


		it('only requests each article once', () => {
			const firstBatch = testCAPIBackend.contentv1(['valid', 'another-valid']);
			return firstBatch.then((it) => {
				expect(stubAPI.callCount).to.eq(2);
				expect(it.length).to.eq(2);
				expect(it[0].item.metadata.genre[0].term.name).to.eq('Analysis');
				expect(it[1].item.metadata.genre[0].term.name).to.eq('Market Report');
				const secondBatch = testCAPIBackend.contentv1(['another-valid', 'valid-3']);

				return secondBatch.then((it) => {
					expect(stubAPI.callCount).to.eq(3);
					expect(it.length).to.eq(2);
					expect(it[0].item.metadata.genre[0].term.name).to.eq('Market Report');
					expect(it[1].item.metadata.genre[0].term.name).to.eq('Comment');
				});
			})
		});



	})
});
