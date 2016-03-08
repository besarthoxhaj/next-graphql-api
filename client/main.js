import playground from './playground';

window.onload = () => {
	if (window.location.pathname === '/playground') {
		const graphiql = document.getElementById('graphiql');
		const apiKey = document.querySelector('.api-key').textContent;
		playground(graphiql, apiKey);
	}
}
