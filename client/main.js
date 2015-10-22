import playground from './playground';

window.onload = () => {
	if (window.location.pathname === '/playground') {
		const graphiql = document.getElementById('graphiql');
		playground.init(graphiql);
	}
}
