import { graphql } from 'graphql';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';
import chai from 'chai';
chai.should();
const expect = chai.expect;

describe('Schema', () => {

	describe('Editor\'s Picks', () => {

		it('should be able to get editor\'s picks', () => {
			const listStub = sinon.stub();
			listStub.returns({ title: 'Editor\'s Picks'});
			const capi = { list: listStub };
			const schema = proxyquire('../../../server/lib/schema', { './backend-adapters/index': () => ({ capi })});
			const query = `
				query EditorsPicks {
					editorsPicks {
						title
					}
				}
			`;

			return graphql(schema, query, {})
				.then(({ data }) => {
					data.editorsPicks.title.should.equal('Editor\'s Picks');
				});
		});

	});

	describe.only('Popular Topics', () => {

		it('should be able to fetch topics', () => {
			const topicsStub = sinon.stub();
			topicsStub.returns([
				{ id: 'abc', taxonomy: 'foo', name: 'One' },
				{ id: 'def', taxonomy: 'bar', name: 'Two' }
			]);
			const popularApi = { topics: topicsStub };
			const schema = proxyquire('../../../server/lib/schema', { './backend-adapters/index': () => ({ popularApi })});
			const query = `
				query PopularTopics {
					popularTopics {
						name
						url
					}
				}
			`;

			return graphql(schema, query, {})
				.then(({ data }) => {
					data.popularTopics.length.should.eq(2);
					expect(data.popularTopics[0]).to.deep.equal({ name: 'One', url: '/stream/fooId/abc' });
					expect(data.popularTopics[1]).to.deep.equal({ name: 'Two', url: '/stream/barId/def' });
				});
		});
	});

	describe('Top Stories', () => {

		it('should be able to fetch', () => {
			const pageStub = sinon.stub();
			pageStub.returns({ title: 'Top Stories', sectionId: '1234' });
			const capi = { page: pageStub };
			const schema = proxyquire('../../../server/lib/schema', { './backend-adapters/index': () => ({ capi })});
			const query = `
				query TopStories {
					top(region: UK) {
						url
						title
					}
				}
			`;

			return graphql(schema, query, {})
				.then(({ data }) => {
					data.top.title.should.equal('Top Stories');
					data.top.url.should.equal('/stream/sectionsId/1234');
				})
		});

	});

	describe('Top Stories List', () => {

		it('should be able to fetch', () => {
			const listStub = sinon.stub();
			listStub.returns({ title: 'Top Stories List', layoutHint: 'bigstory' });
			const capi = { list: listStub };
			const schema = proxyquire('../../../server/lib/schema', { './backend-adapters/index': () => ({ capi })});
			const query = `
				query TopStoriesList {
					topStoriesList(region: UK) {
						title
						layoutHint
					}
				}
			`;

			return graphql(schema, query, {})
				.then(({ data }) => {
					data.topStoriesList.title.should.equal('Top Stories List');
					data.topStoriesList.layoutHint.should.equal('bigstory');
				})
		});

		it('should not break if list api is down', () => {
			const listStub = sinon.stub();
			listStub.returns(null);
			const capi = { list: listStub };
			const schema = proxyquire('../../../server/lib/schema', { './backend-adapters/index': () => ({ capi })});
			const query = `
				query TopStoriesList {
					topStoriesList(region: UK) {
						title
					}
				}
			`;

			return graphql(schema, query, {})
				.then(({ data }) => {
					expect(data).to.have.property('topStoriesList');
					expect(data.topStoriesList).to.be.null;
				})
		});

	});

	describe('User', () => {

		it('should be able to access if header has api key', () => {
			const schema = proxyquire('../../../server/lib/schema', { backend: { }});
			const query = `
				query User {
					user(uuid: "1234") {
						uuid
					}
				}
			`;
			const req = {
				headers: {
					'x-api-key': process.env.GRAPHQL_API_KEY
				}
			};

			return graphql(schema, query, { req })
				.then(({ data }) => {
					data.user.uuid.should.equal('1234');
				})
		});

	});
});
