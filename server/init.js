import bodyParser from 'body-parser';
import express from 'ft-next-express';

var app = express({
	layoutsDir: 'views/layouts'
});

app.use(bodyParser.text());

app.get('/__gtg', (req, res) => {
	res.status(200).end();
});
app.get('/', (req, res) => {
	res.sendStatus(404);
});

import index from './routes/index';
import query from './routes/query';
import schema from './routes/schema';

app.get('/__graphql', index);
// app.post('/__graphql', query);

app.get('/__graphql/schema', schema);

var port = process.env.PORT || 3001;

export default app;
export let listen = app.listen(port, () => {
	console.log('Listening on ' + port);
});
