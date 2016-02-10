import realFetch from 'isomorphic-fetch';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import chai from 'chai';

const expect = chai.expect;
const should = chai.should();

import graphqlClient from '../../../server/lib/graphql';


describe('Top Stories', () => {

	before(() => {
		const clock = sinon.useFakeTimers();
		clock.tick(1000 * 60 * 60 * 60 * 24);
		global.fetch = realFetch;

		fetchMock.mock({
			routes: [
				{
					name: 'capi-page-uk',
					matcher: '^http://api.ft.com/site/v1/pages/4c499f12-4e94-11de-8d4c-00144feabdc0/main-content',
					response: {
						page: { title: 'title' },
						pageItems: [
							{id: 'standard-page-item-1'},
							{id: 'standard-page-item-2'}
						]
					}
				},
				{
					name: 'capi-list-uk',
					matcher: '^http://api.ft.com/lists/520ddb76-e43d-11e4-9e89-00144feab7de',
					response: {
						layoutHint: 'standard',
						items: [
							{id: 'http://api.ft.com/things/standard-list-item-1'},
							{id: 'http://api.ft.com/things/standard-list-item-2'}
						]
					}
				},
				{
					name: 'elastic-search',
					matcher: '^https://search-next-search-',
					response: (url, opts) => {
						const docs = JSON.parse(opts.body).ids.map(id => ({ found: true, _source: { id } }))
						return { docs: docs };
					}
				}
			],
			greed: 'good'
		});
	});




	it('fetches top stories with content from Page', () => {

		return graphqlClient()
			.fetch(`
				query TopStories {
					top(region: UK) {
						layoutHint
						items(limit: 1) {
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
				expect(it.top).to.exist;
				it.top.items.length.should.equal(1);
				it.top.items[0].id.should.equal('standard-page-item-1');
				expect(it.top.layoutHint).to.be.null;
			});
	});


	it('fetches top stories with content and layouthint from List', () => {


		return graphqlClient()
			.fetch(`
				query TopStories {
					topStoriesList(region: UK) {
						layoutHint
						items(limit: 1) {
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
				expect(it.topStoriesList).to.exist;
				it.topStoriesList.items.length.should.equal(1);
				it.topStoriesList.items[0].id.should.equal('standard-list-item-1');
				it.topStoriesList.layoutHint.should.equal('standard');
			});
	});

});
