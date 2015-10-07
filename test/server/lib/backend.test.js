import realFetch from 'isomorphic-fetch';
global.fetch = realFetch;

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import contentv1fixture from './fixtures/contentv1';
import listfixture from './fixtures/list';
import {Backend} from '../../../server/lib/backend';
import PopularAPI from '../../../server/lib/backend-adapters/popular-api';
import Cache from '../../../server/lib/cache';

const mockCAPI = {
	contentv1: () => {
		return Promise.resolve(contentv1fixture);
	},
	list: () => {
		return Promise.resolve(listfixture);
	}
}

describe('GraphQL Backend', () => {
	describe('#contentv1', () => {
		const testBackend = new Backend({capi: mockCAPI}, 'test');

		it('fetches stories', () => {
			const stories = testBackend.contentv1(['some', 'ids'], {});

			return stories.then((it) => {
				expect(it.length).to.eq(3);
			});
		});

		it('filters stories by genre', () => {
			const stories = testBackend.contentv1(['some', 'ids'], {genres: ['analysis', 'comment']});

			return stories.then((it) => {
				expect(it.length).to.eq(2);
			});
		});
	});
	describe('#list', () => {
		const testBackend = new Backend({capi: mockCAPI}, 'test');

		it('fetches list', () => {
			const stories = testBackend.list('73667f46-1a55-11e5-a130-2e7db721f996', {});

			return stories.then((it) => {
				expect(it.items.length).to.eq(11);
			});
		});
	});
	describe('#popularTopics', () => {
		const testBackend = new Backend({popularApi: new PopularAPI(new Cache(10))}, 'test');

		before(() => {
			global.fetch = function() {
				return Promise.resolve({
					json: () => [{a: 'b'}, {b: 'c'}]
				})
			}
		});

		after(() => {
			global.fetch = realFetch;
		})

		it('fetches topics', () => {
			testBackend.popularTopics({})
			.then(it => {
				expect(it.length).to.eq(2);
			})
		})
	})
});
