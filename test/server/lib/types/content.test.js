import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import chai from 'chai';
chai.should();

import { Content } from '../../../../server/lib/types/content';

describe('Content', () => {

	describe('Content', () => {

		const testSchema = source => new GraphQLSchema({
			query: new GraphQLObjectType({
				name: 'Test',
				fields: () => ({
					content: {
						type: Content,
						resolve: () => source
					}
				})
			})
		});

		it('should be able to get Content\'s authors', () => {
			const schema = testSchema({ metadata: [
				{ taxonomy: 'authors', idV1: 'Q0ItMDAwMDgwNQ==-QXV0aG9ycw==', prefLabel: 'Edward Luce' },
				{ taxonomy: 'authors', idV1: 'Q0ItMDA2NTUxOA==-QXV0aG9ycw==', prefLabel: 'Philip Augar' }
			]});
			const query = `
				query Content {
					content {
						authors {
							name
							id
						}
					}
				}
			`;

			return graphql(schema, query)
				.then(({ data }) => {
					data.content.authors.should.have.length(2);
					data.content.authors.should.eql([
						{ id: 'Q0ItMDAwMDgwNQ==-QXV0aG9ycw==', name: 'Edward Luce' },
						{ id: 'Q0ItMDA2NTUxOA==-QXV0aG9ycw==', name: 'Philip Augar' }
					]);
				});
		});

		it('should be able to get author\'s headshot', () => {
			const schema = testSchema({ metadata: [
				{ taxonomy: 'authors', idV1: 'Q0ItMDAwMDgwNQ==-QXV0aG9ycw==', prefLabel: 'Edward Luce' }
			]});
			const query = `
				query Content {
					content {
						authors {
							headshot
						}
					}
				}
			`;

			return graphql(schema, query)
				.then(({ data }) => {
					data.content.authors.should.eql([
						{ headshot: 'https://next-geebee.ft.com/image/v1/images/raw/fthead:edward-luce' }
					]);
				});
		});

		it('should flag if author is a brand', () => {
			const schema = testSchema({ metadata: [
				{ taxonomy: 'authors', idV1: 'Q0ItMDAwMDgwNQ==-QXV0aG9ycw==', prefLabel: 'Edward Luce', primary: 'brand' }
			]});
			const query = `
				query Content {
					content {
						authors {
							isBrand
						}
					}
				}
			`;

			return graphql(schema, query)
				.then(({ data }) => {
					data.content.authors.should.eql([ { isBrand: true } ]);
				});
		});

	});

});
