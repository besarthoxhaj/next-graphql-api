import myftClient from 'next-myft-client';
import sliceList from '../helpers/slice-list';

class Myft {
    constructor(cache) {
        this.type = 'myft';
        this.cache = cache;
    }

    getAllRelationship(uuid, relationship, model, args, ttl = -1) {
        return this.cache.cached(`${this.type}.user.${args.uuid}.saved.content`, ttl, () => (
            myftClient.getAllRelationship('user', uuid, relationship, model, args )
            .then(res => res.items)
        ));
    }

		personalisedFeed(args, ttl=-1) {
			return this.cache.cached(`${this.type}.user.${args.uuid}.personalised-feed`, ttl, () => (
				fetch(`https://ft-next-personalised-feed-api.herokuapp.com/v2/feed/${args.uuid}?originatingSignals=followed&from=-7d`, {
					headers: {
						'X-FT-Personalised-Feed-Api-Key': process.env.PERSONALISED_FEED_API_KEY
					}
				})
				.then(res => res.json())
				.then(res => sliceList(res.results, args))
			));
		}
}

export default Myft;
