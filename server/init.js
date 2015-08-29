'use strict';

import express from 'ft-next-express';

var app = express({
	layoutsDir: 'views/layouts'
});

app.get('/__graphql', (req, res) => {
	res.render('index', {
		layout: 'techdocs'
	});
});

app.get('/__gtg', (req, res) => {
	res.status(200).end();
});
app.get('/', (req, res) => {
	res.sendStatus(404);
});

var port = process.env.PORT || 3001;

export default app;
export let listen = app.listen(port, () => {
	console.log('Listening on ' + port);
});
