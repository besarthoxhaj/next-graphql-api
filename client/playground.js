import 'isomorphic-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import GraphiQL from 'graphiql';

const fetcher = (apiKey, params) => {
	console.log('GraphiQL submitted', params);

	return fetch(`/data?apiKey=${apiKey}`, {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params)
		})
		.then(response => response.json())
		.then(data => ({ data }))
};

export default (el, apiKey) => ReactDOM.render(<GraphiQL fetcher={fetcher.bind(null, apiKey)} />, el);
