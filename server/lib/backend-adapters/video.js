import sliceList from '../helpers/sliceList';

class Playlist {
	constructor(cache) {
		this.cache = cache;
	}

	playlist(id, {from, limit}, ttl = 50) {
		return this.cache.cached(`videos.playlist.${id}`, ttl, () => {
			return fetch(`http://next-video.ft.com/api/playlist/${encodeURI(id)}?videoFields=id,name,renditions,longDescription,publishedDate,videoStillURL`)
				.then(res => res.json())
				.then(json => json.items)
				.then(topics => sliceList(topics, {from, limit}));
		});
	}
}

export default Playlist;
