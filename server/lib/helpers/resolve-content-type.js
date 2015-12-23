
export default (value) => {
	if (/liveblog|marketslive|liveqa/i.test(value.webUrl)) {
		return 'liveblog';
	} else {
		return 'article';
	}
}
