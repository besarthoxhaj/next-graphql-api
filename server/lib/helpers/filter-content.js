import sliceList from '../helpers/sliceList';
import articleGenres from 'ft-next-article-genre';
import capifyMetadata from '../helpers/capifyMetadata';

// internal content filtering logic shared for ContentV1 and ContentV2
export default ({from, limit, genres, type}, resolveType) => {
	return (items = []) => {

		if(!Array.isArray(items)) {
			return [items];
		}

		if (genres && genres.length) {
			items = items.filter(item => genres.indexOf(articleGenres(capifyMetadata(item.metadata), {requestedProp: 'editorialTone'})) > -1);
		}

		if (type) {
			if(type === 'liveblog') {
				items = items.filter(it => resolveType(it) === 'liveblog');
			} else {
				items = items.filter(it => resolveType(it) !== 'liveblog');
			}
		}
		return sliceList(items, {from, limit});
	};
};
