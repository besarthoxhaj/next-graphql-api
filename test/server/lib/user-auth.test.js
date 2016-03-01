import realFetch from 'isomorphic-fetch';
import fetchMock from 'fetch-mock';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.should();
chai.use(chaiAsPromised);

import userAuth from '../../../server/lib/user-auth';

describe.only('User Auth', () => {

	before(() => {
	});

	afterEach(() => {
		fetchMock.restore();
	});

	it('should return uuid if header has correct api key', () => {
		const req =  {
			headers: {
				'x-api-key': process.env.GRAPHQL_API_KEY
			}
		};
		return userAuth(req, '1234')
			.then(uuid => {
				uuid.should.equal('1234');
			})
	});

	it('should return uuid if query string has correct api key', () => {
		const req =  {
			query: {
				apiKey: process.env.GRAPHQL_API_KEY
			}
		};
		return userAuth(req, '1234')
			.then(uuid => {
				uuid.should.equal('1234');
			})
	});

	it('should throw error if incorrect api key', () => {
		const req =  {
			headers: {
				'x-api-key': 'bad-api-key'
			}
		};
		return userAuth(req, '1234').should.be.rejectedWith('Bad or missing apiKey');
	});

	it('should return uuid if valid session', () => {
		fetchMock.mock('https://session-next.ft.com/uuid', { uuid: '1234' });
		const req =  {
			cookies: {
				FTSession: 'session-id'
			},
			headers: { }
		};
		return userAuth(req, '1234')
			.then(uuid => {
				uuid.should.equal('1234');
			})
	});

	it('should throw error if invalid session', () => {
		fetchMock.mock('https://session-next.ft.com/uuid', 404);
		const req =  {
			cookies: {
				FTSession: 'session-id'
			},
			headers: { }
		};
		return userAuth(req, '1234').should.be.rejectedWith('Failed session auth');
	});

});
