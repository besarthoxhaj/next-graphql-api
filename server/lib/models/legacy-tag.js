export default tag => {
	if (tag) {
		return {
			taxonomy: tag.taxonomy,
			name: tag.prefLabel,
			url: '/stream/' + tag.taxonomy + 'Id/' + encodeURIComponent(tag.idV1),
			id: tag.idV1
		};
	}
};
