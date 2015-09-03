import playground from './playground';

window.onload = function() {
	let graphiql = document.getElementById('graphiql');
	playground.init(graphiql)
}
