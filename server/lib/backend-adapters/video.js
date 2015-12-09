class Playlist {
	constructor(cache) {
		this.cache = cache;
	}

	playlist(id, ttl = 50) {
		return this.cache.cached(`videos.playlist.${id}`, ttl, () => {
			return fetch(`http://next-video.ft.com/api/playlist/${encodeURI(id)}?videoFields=id,name,renditions,longDescription,publishedDate,videoStillURL`)
				.then(res => res.json())
				.then(json => json.items);
		});
	}
}

export default Playlist;
