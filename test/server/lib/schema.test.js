import fetch from 'isomorphic-fetch';
global.fetch = fetch;

import chai from 'chai';
import sinon from 'sinon';
chai.should();

import {graphql} from 'graphql';
import graphqlClient from '../../../server/lib/graphql';
import schema from '../../../server/lib/schema';

describe('GraphQL Schema', () => {
	describe('#list', () => {
		it('fetches list', () => {
			return graphqlClient(false, true, { flags: { editorsPicksFromList: true } })
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
		const topics = Promise.resolve([
			{id: 'abc', taxonomy: 'foo', name: 'One'},
			{id: 'def', taxonomy: 'bar', name: 'Two'}
		]);

		const backendSpy = {
			popularTopics: sinon.stub().returns(topics)
		};

		it('fetches a list of topics', () => {
			const query = `query Topics {
				popularTopics {
					name
					url
				}
			}`;

			return graphql(schema, query, { backend: backendSpy })
			.then(({data: {popularTopics}}) => {
				popularTopics.length.should.eq(2);

				popularTopics[0].name.should.eq('One');
				popularTopics[0].url.should.eq('/stream/fooId/abc');

				popularTopics[1].name.should.eq('Two');
				popularTopics[1].url.should.eq('/stream/barId/def');
			})
		})
	})
});
