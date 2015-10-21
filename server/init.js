import bodyParser from 'body-parser';
import express from 'ft-next-express';
import healthChecks from './lib/health-checks.js';

// starts polling the health checks
healthChecks.init();

const app = express({
	layoutsDir: 'views/layouts',
	withBackendAuthentication: false,
	healthChecks: healthChecks.healthChecks
});
const logger = express.logger;

app.use(bodyParser.text());
app.use(bodyParser.json());

app.get('/__gtg', (req, res) => {
	res.status(200).end();
});

app.use((req, res, next) => {
	const apiKey = req.headers['x-api-key'] || req.query.apiKey;
	if (!apiKey || apiKey !== process.env.GRAPHQL_API_KEY) {
		logger.error('Bad or missing apiKey');
		res.status(401).send('Bad or missing apiKey');
	} else {
		next();
	}
});

import index from './routes/index';
import query from './routes/query';
import schema from './routes/schema';
import playground from './routes/playground';

app.get('/', index);
app.post('/', query);

app.get('/schema', schema);
app.get('/playground', playground);

const port = process.env.PORT || 3001;

export default app;
export let listen = app.listen(port, () => {
	logger.info('Listening on ' + port);
});
