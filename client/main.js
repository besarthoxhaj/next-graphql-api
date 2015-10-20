import playground from './playground';

window.onload = () => {
	if (window.location.pathname === '/playground') {
		document.querySelector('.start-playground')
			.addEventListener('click', () => {
				const apiKey = document.querySelector('.api-key').value;
				if (!apiKey) {
					return;
				}
				const graphiql = document.getElementById('graphiql');
				playground.init(graphiql, apiKey);
			});
	}
}
