require('isomorphic-fetch');

import React from 'react';
import GraphiQL from 'graphiql';

const fetcher = (apiKey, params) => {
	console.log('GraphiQL submitted', params);

	return fetch(`/?apiKey=${apiKey}`, {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params)
		})
		.then(response => response.json())
		.then(it => ({ data: it }))
};

export default {
	init: (el, apiKey) => {
		React.render(<GraphiQL fetcher={fetcher.bind(null, apiKey)} />, el);
	}
}
