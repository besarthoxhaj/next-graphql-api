import sources from '../../config/sources';

import FastFtFeed from './fast-ft';
import CAPI from './capi';
import MockCapi from './mock-capi';
import Hui from './hui';
import Liveblog from './liveblog';
import MockLiveblog from './mock-liveblog';
import Video from './video';
import PopularAPI from './popular-api';
import Myft from './myft';
import TodaysTopics from './todays-topics';
import Bertha from './bertha';

import Cache from '../cache';

const memCache = new Cache(12 * 60 * 60, 30 * 60);

const capi = new CAPI(memCache);
const mockCapi = new MockCapi(capi);
const fastFT = new FastFtFeed(sources.fastFt);
const hui = new Hui(memCache);
const liveblog = new Liveblog(memCache);
const mockLiveblog = new MockLiveblog(liveblog);
const myft = new Myft(memCache);
const popularApi = new PopularAPI(memCache);
const video = new Video(memCache);
const todaysTopics = new TodaysTopics(memCache);
const bertha = new Bertha(memCache);

export default (flags = {}) => ({
	capi: flags.mockFrontPage ? mockCapi : capi,
	fastFT,
	hui,
	liveblog: flags.mockFrontPage ? mockLiveblog : liveblog,
	myft,
	popularApi,
	video,
	todaysTopics,
	bertha
});
