import realFetch from 'isomorphic-fetch';
global.fetch = realFetch;

import chai from 'chai';
chai.should();

import graphqlClient from '../../../server/lib/graphql';

describe.only('Top Stories', () => {

	afterEach(() => {
		global.fetch = realFetch;
	});

	it('fetches page with layouthint from list', () => {

		global.fetch = function (url) {
			if(url.indexOf('list') >= 0) {
				return {
					layoutHint: 'standard',
					items: [
						{id: 'standard-list-item-1'},
						{id: 'standard-list-item-2'}
					]
				}
			} else if (url.indexOf('list') >= 0) {
				return Promise.resolve({
					json: () => {
						items: [
							{id: 'standard-page-item-1'},
							{id: 'standard-page-item-2'}
						]
					}
				})
			}
		}
		return graphqlClient({ mockFrontPage: true, editorsPicksFromList: true })
			.fetch(`
				query TopStories {
					top(region: UK) {
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
				console.log('it', it);
			});
	});
});
