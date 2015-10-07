import playground from './playground';

window.onload = () => {
	if (window.location.pathname === '/playground') {
		let graphiql = document.getElementById('graphiql');
		playground.init(graphiql)
	}
}
