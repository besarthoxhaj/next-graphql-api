class Playlist {
	constructor(cache) {
		this.cache = cache;
	}

	fetch(id, ttl = 50) {
		return this.cache.cached(`videos.${id}`, ttl, () => {
			return fetch('http://next-video.ft.com/api/playlist/' + encodeURI(id))
				.then(res => res.json())
				.then(json => json.items);
		});
	}
}

export default Playlist;
