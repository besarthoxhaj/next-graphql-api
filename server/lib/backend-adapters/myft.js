import myftClient from 'next-myft-client';

class Myft {
    constructor(cache) {
        this.type = 'myft';
        this.cache = cache;
    }

    userArticles(uuid, ttl = 50) {
        return this.cache.cached(`${this.type}.user.${uuid}.saved.content`, ttl, () => (
            myftClient.getAllRelationship('user', uuid, 'saved', 'content')
        ));
    }
}

export default Myft;
