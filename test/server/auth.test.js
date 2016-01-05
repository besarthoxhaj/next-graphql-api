import request from 'supertest';

import app from '../../server/init';

import fetchMock from 'fetch-mock';

require('chai').should();

const queries = {
	userWithUUID: "query FrontPage { user(uuid: \"1234\") { saved { id title } } }",
	userWithRandomUUID: "query FrontPage { user(uuid: \"not-me\") { saved { id title } } }",
	userFromClient: "query FrontPage { user { saved { id title } } }",
	normal: "query FrontPage { technology { items { id title } } }"
};

describe('Authentication', () => {

	beforeEach(() => {

		if(fetchMock.isMocking) {
			fetchMock.restore();
		}


		fetchMock.mock({
			routes: [
				{
					name: 'session-service',
					matcher: '^https://session-next.ft.com',
					response: { uuid: '1234' }
				},
				{
					name: 'capi',
					matcher: '^http://api.ft.com',
					response: 200
				},
				{
					name: 'myft-api',
					matcher: '^http://my.ft.com',
					response: { items: [] }
				}

			],
			greed: 'bad'
		});

	});

	afterEach(() => {
		fetchMock.restore();
	});

	describe('User with an API key in query string', () => {
		it('can request normal data via GET', () => {
			return request(app)
			.get(`/data?apiKey=${process.env.GRAPHQL_API_KEY}&query=${encodeURIComponent(queries.normal)}`)
		.expect(200);
		});

		it('can request user data with a user uuid via GET', () => {
			return request(app)
			.get(`/data?apiKey=${process.env.GRAPHQL_API_KEY}&query=${encodeURIComponent(queries.userWithUUID)}`)
			.expect(200)
			.expect(() => {
				fetchMock.called('myft-api').should.be.true;
			})
		});

		it('will not get session details passed', () => {
			return request(app)
			.get(`/data?apiKey=${process.env.GRAPHQL_API_KEY}&query=${encodeURIComponent(queries.userFromClient)}`)
			.expect(500)
			.expect((response) => {
				fetchMock.called('session-service').should.be.false;
				fetchMock.called('myft-api').should.be.false;
				response.error.text.should.include("Must specify a user UUID");
			})
		})


	});

	describe('User with an invalid API key in query string', () => {
		it('can request normal data via GET', () => {
			return request(app)
			.get(`/data?apiKey=invalidKey&query=${encodeURIComponent(queries.normal)}`)
			.expect(401);
		});

		it('can request user data with a user uuid via GET', () => {
			return request(app)
			.get(`/data?apiKey=invalidKey&query=${encodeURIComponent(queries.userWithUUID)}`)
			.expect(401)
			.expect(() => {
				fetchMock.called('session-service').should.be.false;
				fetchMock.called('myft-api').should.be.false;
			})
		});

		it('will not get session details passed from client', () => {
			return request(app)
			.get(`/data?apiKey=invalidKey&query=${encodeURIComponent(queries.userFromClient)}`)
			.expect(401)
			.expect((response) => {
				fetchMock.called('session-service').should.be.false;
				fetchMock.called('myft-api').should.be.false;
				response.error.text.should.include("Bad or missing apiKey");
			})
		})


	});

	describe('User with a session token', () => {
		it('can request normal data via GET', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.normal)}`)
			.set('Cookie', 'FTSession=session-token')
			.expect(200);
		});

		it('can request user data with their own user uuid via GET', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userWithUUID)}`)
			.set('Cookie', 'FTSession=session-token')
			.expect(200)
			.expect(() => {
				fetchMock.called('myft-api').should.be.true;
			})
		});

		it('cannot request another users data', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userWithRandomUUID)}`)
			.set('Cookie', 'FTSession=session-token')
			.expect(401)
			.expect(() => {
				fetchMock.called('session-service').should.be.true;
				fetchMock.called('myft-api').should.be.false;
			})
		});

		it('will get session details passed', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userFromClient)}`)
			.set('Cookie', 'FTSession=session-token')
			.expect(200)
			.expect(() => {
				fetchMock.called('session-service').should.be.true;
				fetchMock.called('myft-api').should.be.true;
			})
		});

	});

	describe('User with an invalid session token', () => {

		beforeEach(() => {
			fetchMock.reMock({
				routes: {
					name: 'session-service',
					matcher: '^https://session-next.ft.com',
					response: 404
				}
			});
		});

		it('can request normal data via GET', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.normal)}`)
			.set('Cookie', 'FTSession=invalid-session-token')
			.expect(200)
			.expect(() => {
				fetchMock.called('session-service').should.be.true;
			})
		});

		it('cannot request user data with their own user uuid via GET', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userWithUUID)}`)
			.set('Cookie', 'FTSession=invalid-session-token')
			.expect(401)
			.expect(() => {
				fetchMock.called('myft-api').should.be.false;
			})
		});

		it('cannot request another users data', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userWithRandomUUID)}`)
			.set('Cookie', 'FTSession=invalid-session-token')
			.expect(401)
			.expect(() => {
				fetchMock.called('session-service').should.be.true;
				fetchMock.called('myft-api').should.be.false;
			})
		});

		it('cannot access their own user data from client', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userFromClient)}`)
			.set('Cookie', 'FTSession=invalid-session-token')
			.expect(401)
			.expect(() => {
				fetchMock.called('session-service').should.be.true;
				fetchMock.called('myft-api').should.be.false;
			})
		});

	});



	describe('User with no session token', () => {


		it('can request normal data via GET', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.normal)}`)
			.expect(() => {
				fetchMock.called('session-service').should.be.false;
			})
			.expect(200);
		});

		it('cannot request user data with their own user uuid', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userWithUUID)}`)
			.expect(401)
			.expect(() => {
				fetchMock.called('session-service').should.be.false;
				fetchMock.called('myft-api').should.be.false;
			})
		});

		it('cannot request another users data', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userWithRandomUUID)}`)
			.expect(401)
			.expect(() => {
				fetchMock.called('session-service').should.be.false;
				fetchMock.called('myft-api').should.be.false;
			})
		});

		it('cannot access their own user data from client', () => {
			return request(app)
			.get(`/data?query=${encodeURIComponent(queries.userFromClient)}`)
			.expect(401)
			.expect(() => {
				fetchMock.called('session-service').should.be.false;
				fetchMock.called('myft-api').should.be.false;
			})
		});

	});

});
