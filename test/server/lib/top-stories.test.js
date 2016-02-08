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
					response: 500
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



	it('still works when lists API is down', () => {

		return graphqlClient({ frontPageMultipleLayouts: true })
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
				should.equal(it.top.layoutHint, null);
			});
	});


	it('Returns only the page when frontPageMultipleLayouts flag is off', () => {

		fetchMock.reMock({
			routes: [
				{
					name: 'capi-list-uk',
					matcher: '^http://api.ft.com/lists/520ddb76-e43d-11e4-9e89-00144feab7de',
					response: {
						layoutHint: 'standard',
						items: [
							{id: 'standard-list-item-1'},
							{id: 'standard-list-item-2'}
						]
					}
				}
			]
		});

		return graphqlClient({ frontPageMultipleLayouts: false })
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
				should.equal(it.top.layoutHint, null);
			});
	});

	it('fetches page with layouthint from list and content from page', () => {

		fetchMock.reMock({
			routes: [
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
				}
			]
		});

		return graphqlClient({ frontPageMultipleLayouts: true })
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
				it.top.layoutHint.should.equal('standard');
			});
	});


	it('if the layout is a picture story, brings in the top story from the list', () => {

		fetchMock.reMock({
			routes: [
				{
					name: 'capi-page-us',
					matcher: '^http://api.ft.com/site/v1/pages/b0ed86f4-4e94-11de-8d4c-00144feabdc0/main-content',
					response: {
						page: { title: 'title' },
						pageItems: [
							{id: 'standard-page-item-1'},
							{id: 'standard-page-item-2'}
						]
					}
				},
				{
					name: 'capi-list-us',
					matcher: '^http://api.ft.com/lists/b0d8e4fe-10ff-11e5-8413-00144feabdc0',
					response: {
						layoutHint: 'standaloneimage',
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
			]
		});

		return graphqlClient({ frontPageMultipleLayouts: true })
			.fetch(`
				query TopStories {
					top(region: US) {
						layoutHint
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
				expect(it.top).to.exist;
				it.top.items.length.should.equal(2);
				it.top.items[0].id.should.equal('standard-list-item-1');
				it.top.items[1].id.should.equal('standard-page-item-1');
				it.top.layoutHint.should.equal('standaloneimage');
			});
	});
});
