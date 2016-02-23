import realFetch from 'isomorphic-fetch';
import fetchMock from 'fetch-mock';
global.fetch = realFetch;

import chai from 'chai';
chai.should();
const expect = chai.expect;

import graphqlClient from '../../../server/lib/graphql';

describe('GraphQL Schema', () => {
	describe('#list', () => {
		it('fetches list', () => {
			return graphqlClient({ mockFrontPage: true, editorsPicksFromList: true })
				.fetch(`
					query List {
						editorsPicks {
							items(limit: 2) {
								type: __typename
								contentType
								id
								title
								lastPublished
							}
						}
					}
				`)
				.then(it => {
					it.editorsPicks.items.length.should.eq(2);
					it.editorsPicks.items.forEach(item => {
						item.contentType.should.exist;
						item.id.should.exist;
						item.title.should.exist;
						item.lastPublished.should.exist;
					});
				});
		});
	});

	describe('popularTopics', () => {

		before(() => {
			global.fetch = function () {
				return Promise.resolve({
					json: () => [
						{id: 'abc', taxonomy: 'foo', name: 'One'},
						{id: 'def', taxonomy: 'bar', name: 'Two'}
					]
				})
			}
		});

		after(() => {
			global.fetch = realFetch;
		});

		it('fetches a list of topics', () => {
			const query = `query Topics {
				popularTopics {
					name
					url
				}
			}`;

			return graphqlClient()
			.fetch(query)
			.then((data) => {
				data.popularTopics.length.should.eq(2);

				data.popularTopics[0].name.should.eq('One');
				data.popularTopics[0].url.should.eq('/stream/fooId/abc');

				data.popularTopics[1].name.should.eq('Two');
				data.popularTopics[1].url.should.eq('/stream/barId/def');
			})
		})
	});

	describe.only('topStoriesList', () => {

		before(() => {
			fetchMock.mock('http://api.ft.com/lists/520ddb76-e43d-11e4-9e89-00144feab7de', 500)
		});

		after(() => {
			fetchMock.restore();
		});

		it('should not break if list api is down', () => {
			const query = `
				query List {
					topStoriesList(region: UK) {
						title
					}
				}
			`;
			return graphqlClient()
				.fetch(query)
				.then(data => {
					expect(data).to.have.property('topStoriesList');
					expect(data.topStoriesList).to.equal.null;
				})
		});
	});
});
