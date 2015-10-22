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

import query from './routes/query';
app.post('/', query);

import authS3O from 's3o-middleware';
import index from './routes/index';
import schema from './routes/schema';
import playground from './routes/playground';


app.use(authS3O);
app.get('/', index);
app.get('/schema', schema);
app.get('/playground', playground);

const port = process.env.PORT || 3001;

export default app;
export let listen = app.listen(port, () => {
	logger.info('Listening on ' + port);
});
