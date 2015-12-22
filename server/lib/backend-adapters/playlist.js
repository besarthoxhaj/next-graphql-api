class Playlist {
	constructor(cache) {
		this.cache = cache;
	}

	fetch(id, ttl = 50) {
		return this.cache.cached(`videos.${id}`, ttl, () => {
			return fetch(`http:\/\/next-video.ft.com/api/playlist/${encodeURI(id)}?videoFields=id,name,renditions,longDescription,publishedDate,videoStillURL`)
				.then(res => res.json())
				.then(json => json.items)
				.then(json => {
					const renditionsPresent = obj => obj.renditions.length > 0;
					return json.filter(renditionsPresent);
				});
		});
	}
}

export default Playlist;
