const api = require('next-ft-api-client');

const articleUuid = 'd0377096-f290-11e4-b914-00144feab7de';
const listUuid = '73667f46-1a55-11e5-a130-2e7db721f996';
const pageUuid = 'fcdae4e8-cd25-11de-a748-00144feabdc0';
const fastFtUuid = 'fcdae4e8-cd25-11de-a748-00144feabdc0';
const playlistId = '69917354001';
const searchQuery = 'brand:"Person in the news"';

const checkInterval = 60 * 1000;

const healthChecks = [
    {
        name: 'Elasticsearch: Article (CAPIv2)',
        status: false,
        businessImpact: 'API may not be able to serve articles',
        severity: 2,
        technicalSummary: 'Tries to fetch a capi v2 article from elasticsearch',
        check: function () {
            api.content({
                uuid: articleUuid,
                useElasticSearch: true
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'Elasticsearch: Article (CAPIv1)',
        status: false,
        businessImpact: 'API may not be able to serve articles',
        severity: 2,
        technicalSummary: 'Tries to fetch a capi v1 article from elasticsearch',
        check: function () {
            api.contentLegacy({
                uuid: articleUuid,
                useElasticSearch: true
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'Elasticsearch: By Concept',
        status: false,
        businessImpact: 'API may not be able to serve related articles',
        severity: 2,
        technicalSummary: 'Tries to fetch articles by a concept from elasticsearch',
        check: function () {
            api.contentAnnotatedBy({
                uuid: articleUuid,
                useElasticSearch: true
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'Elasticsearch: Search',
        status: false,
        businessImpact: 'API may not be able to serve searched articles',
        severity: 2,
        technicalSummary: 'Tries to search elasticsearch',
        check: function () {
            api.searchLegacy({
                query: searchQuery,
                useElasticSearch: true
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'CAPIv2: Article',
        status: false,
        businessImpact: 'API may not be able to serve articles',
        severity: 2,
        technicalSummary: 'Tries to fetch an article from capi v2',
        check: function () {
            api.content({
                uuid: articleUuid,
                useElasticSearch: false
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'CAPIv2: By Concept',
        status: false,
        businessImpact: 'API may not be able to serve related articles',
        severity: 2,
        technicalSummary: 'Tries to fetch articles by a concept from capi v2',
        check: function () {
            api.contentAnnotatedBy({
                uuid: articleUuid,
                useElasticSearch: false
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'CAPIv2: List',
        status: false,
        businessImpact: 'API may not be able to serve lists',
        severity: 2,
        technicalSummary: 'Tries to fetch a list from capi v2',
        check: function () {
            api.lists({
                uuid: listUuid
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'CAPIv2: Page',
        status: false,
        businessImpact: 'API may not be able to serve pages',
        severity: 2,
        technicalSummary: 'Tries to fetch a page from capi v2',
        check: function () {
            api.pages({
                uuid: pageUuid
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'CAPIv2: Notifications',
        status: false,
        businessImpact: 'API may not know when new articles are created',
        severity: 2,
        technicalSummary: 'Tries to fetch notifications for fastFt',
        check: function () {
            const since = new Date().toISOString();
            fetch(`http://api.ft.com/content/notifications?since=${since}&apiKey=${process.env.FAST_FT_KEY}`)
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'CAPIv1: Article',
        status: false,
        businessImpact: 'API may not be able to serve articles',
        severity: 2,
        technicalSummary: 'Tries to fetch an article from capi v1',
        check: function () {
            api.contentLegacy({
                uuid: articleUuid,
                useElasticSearch: false
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'CAPIv1: Search',
        status: false,
        businessImpact: 'API may not be able to serve searched articles',
        severity: 2,
        technicalSummary: 'Tries to search capi v1',
        check: function () {
            api.searchLegacy({
                query: searchQuery,
                useElasticSearch: false
            })
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'Playlist',
        status: false,
        businessImpact: 'API may not be able to serve video playlists',
        severity: 2,
        technicalSummary: 'Tries to fetch a playlist from Brightcove',
        check: function () {
            fetch(`https://next-video.ft.com/api/playlist/${playlistId}`)
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'Popular Topics',
        status: false,
        businessImpact: 'API may not be able to serve popular topics',
        severity: 2,
        technicalSummary: 'Tries to fetch popular topics from the popular-api',
        check: function () {
            fetch(`https://ft-next-popular-api.herokuapp.com/topics?apiKey=${process.env.POPULAR_API_KEY}`)
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    },
    {
        name: 'Popular Articles',
        status: false,
        businessImpact: 'API may not be able to serve popular articles',
        severity: 2,
        technicalSummary: 'Tries to fetch popular articles from the mostpopular api',
        check: function () {
            fetch('http://mostpopular.sp.ft-static.com/v1/mostPopular?source=nextArticle')
                .then(() => this.status = true)
                .catch(() => this.status = false);
        }
    }
];

const checkAll = () => {
    healthChecks.forEach(healthCheck => healthCheck.check());
};

export default {
    init: function() {
        checkAll();
        setInterval(checkAll, checkInterval);
    },
    healthChecks: healthChecks.map(healthCheck => ({
        getStatus: () => ({
            name: healthCheck.name,
            ok: healthCheck.status,
            businessImpact: healthCheck.businessImpact,
            severity: healthCheck.severity,
            technicalSummary: healthCheck.technicalSummary
        })
    }))
};
