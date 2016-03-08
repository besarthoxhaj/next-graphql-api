import sliceList from '../helpers/slice-list';

export default class {
	constructor (cache) {
		this.cache = cache;
	}

	fetch (id, { from, limit }, ttl = 60) {
		return this.cache.cached(`videos.playlist.${id}`, ttl, () =>
				fetch(`http://next-video.ft.com/api/playlist/${encodeURI(id)}?videoFields=id,name,renditions,longDescription,publishedDate,videoStillURL`)
					.then(res => res.json())
					.then(json => json.items)
					.then(json => json.filter(video => video.renditions.length > 0))
			)
			.then(topics => sliceList(topics, { from, limit }));
	}
}
