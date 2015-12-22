class Popular {
	constructor(cache) {
		this.cache = cache;
	}

	fetch(url, ttl = 50) {
		return this.cache.cached(`popular.${url}`, ttl, () => {
			return fetch(url)
				.then(response => response.json())
				.then((data) => {
					return data.mostRead.pages.map(function (page) {
						const index = page.url.lastIndexOf('/');
						const id = page.url.substr(index + 1).replace('.html', '');
						return id;
					});
				})
				.then((ids) => ({
					id: null,
					sectionId: null,
					title: title,
					items: ids
				}));
		});
	}
}

export default Popular;
