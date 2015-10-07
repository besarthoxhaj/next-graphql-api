require('isomorphic-fetch');

import React from 'react';
import GraphiQL from 'graphiql';

const apiKey = window.location.search
	.substring(1)
	.split('&')
	.find(part => part.startsWith('apiKey'))
	.split('=')
	.pop();

const fetcher = (params) => {
	console.log('GraphiQL submitted', params);

	return fetch(`/?apiKey=${apiKey}`, {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params)
		})
		.then(response => response.json())
		.then(it => ({ data: it }))
}

export default {
	init: (el) => {
		React.render(<GraphiQL fetcher={fetcher} />, el);
	}
}
