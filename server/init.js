import bodyParser from 'body-parser';
import express from 'ft-next-express';

const app = express({
	layoutsDir: 'views/layouts'
});
const logger = express.logger;

app.use(bodyParser.text());
app.use(bodyParser.json());

app.get('/__gtg', (req, res) => {
	res.status(200).end();
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
