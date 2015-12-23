import realFetch from 'isomorphic-fetch';
global.fetch = realFetch;

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect;

import Popular from '../../../server/lib/backend-adapters/popular';
import Cache from '../../../server/lib/cache';


describe('#popularTopics', () => {

	before(() => {
		global.fetch = function() {
			return Promise.resolve({
				json: () => [{a: 'b'}, {b: 'c'}]
			})
		}
	});

	after(() => {
		global.fetch = realFetch;
	});

	const cache = new Cache(10);
	const testBackend = new Popular(cache);

	it('fetches topics', () => {
		testBackend.fetch({})
		.then(it => {
			expect(it.length).to.eq(2);
		})
	})
});
