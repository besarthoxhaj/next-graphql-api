export default class {
	constructor (cache) {
		this.type = 'bertha';
		this.cache = cache;
	}

	get(sheetKey, sheetName, ttl = 60 * 10) {
		const cacheKey = `${this.type}.sheet.${sheetKey}.${sheetName}`;
		return this.cache.cached(cacheKey, ttl, () => {
			return fetch(`https://bertha.ig.ft.com/view/publish/gss/${sheetKey}/${sheetName}`, {
				method: 'get',
				headers: { 'Content-Type': 'application/json' }
			})
			.then(r => r.json());
		});
	}
}
