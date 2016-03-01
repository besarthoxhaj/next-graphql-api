import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import authS3O from 's3o-middleware';

import express from 'ft-next-express';
import nHealth from 'n-health';
import jsonpMiddleware from '@financial-times/n-jsonp';

import query from './routes/query';
import index from './routes/index';
import schema from './routes/schema';
import playground from './routes/playground';
import cors from './middleware/cors';
import cacheControl from './middleware/cache-control';
import additionalHealthChecks from './lib/health-checks/index';

const healthChecks = nHealth(path.resolve(__dirname, './config/health-checks'), additionalHealthChecks);
const app = express({
	layoutsDir: 'views/layouts',
	withBackendAuthentication: false,
	healthChecks: healthChecks.asArray()
});

app.use(cookieParser());
app.use(bodyParser.text());
app.use(bodyParser.json());

app.get('/__gtg', (req, res) => {
	res.status(200).end();
});
app.post('/', cacheControl, query);
app.post('/data', cacheControl, query);
app.get('/data', cacheControl, cors, jsonpMiddleware, query);

app.use(authS3O);
app.get('/', index);
app.get('/schema', schema);
app.get('/playground', playground);

const listen = app.listen(process.env.PORT || 3001, () => { });

export default app;
export { listen };
