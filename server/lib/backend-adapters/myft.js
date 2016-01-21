import myftClient from 'next-myft-client';
import sliceList from '../helpers/slice-list';

class Myft {
    constructor() {
        this.type = 'myft';
    }

    getAllRelationship(uuid, relationship, model, args) {
		return myftClient.getAllRelationship('user', uuid, relationship, model, args)
            .then(res => { console.log(res.items); return res.items; })
			.catch(err => { console.log(err); return []; });
    }

	personalisedFeed(args) {
		return fetch(`https://ft-next-personalised-feed-api.herokuapp.com/v2/feed/${args.uuid}?originatingSignals=followed&from=-7d`, {
			headers: {
				'X-FT-Personalised-Feed-Api-Key': process.env.PERSONALISED_FEED_API_KEY
			}
		})
			.then(res => res.json())
			.then(res => sliceList(res.results, args));
	}

	getViewed(uuid, { limit = 10 }) {
		// NOTE: not caching, as would get too diluted keying off the uuid
		return myftClient.fetchJson('GET', `/next/popular-concepts/${uuid}`)
			.then(results => results.viewed.filter(concept => concept).slice(0, limit));
	}
}

export default Myft;
