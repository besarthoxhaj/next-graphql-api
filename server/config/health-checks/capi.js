const articleUuid = 'd0377096-f290-11e4-b914-00144feab7de';
const listUuid = '73667f46-1a55-11e5-a130-2e7db721f996';
const pageUuid = 'fcdae4e8-cd25-11de-a748-00144feabdc0';
const conceptUuid = '5c7592a8-1f0c-11e4-b0cb-b2227cce2b54';
const searchQuery = 'brand:"Person in the news"';

export default {
    name: 'CAPI',
    description : 'CAPI service health checks',
    checks : [
        {
            name: 'Article (v2)',
            severity: 2,
            businessImpact: 'API may not be able to serve articles',
            technicalSummary: 'Tries to fetch a CAPI v2 article',
            panicGuide: 'Don\'t Panic',
            type: 'capi',
            capiMethod: 'content',
            capiOptions: {
                uuid: articleUuid
            }
        },
        {
            name: 'Article (v1)',
            severity: 2,
            businessImpact: 'API may not be able to serve articles',
            technicalSummary: 'Tries to fetch a CAPI v1 article',
            panicGuide: 'Don\'t Panic',
            type: 'capi',
            capiMethod: 'contentLegacy',
            capiOptions: {
                uuid: articleUuid
            }
        },
        {
            name: 'Search',
            severity: 2,
            businessImpact: 'API may not be able to serve searched articles',
            technicalSummary: 'Tries to search for an article',
            panicGuide: 'Don\'t Panic',
            type: 'capi',
            capiMethod: 'searchLegacy',
            capiOptions: {
                query: searchQuery
            }
        },
        {
            name: 'By Concept',
            severity: 2,
            businessImpact: 'API may not be able to serve related articles',
            technicalSummary: 'Tries to fetch articles by a concept',
            panicGuide: 'Don\'t Panic',
            type: 'capi',
            capiMethod: 'contentAnnotatedBy',
            capiOptions: {
                uuid: conceptUuid
            }
        },
        {
            name: 'List',
            severity: 2,
            businessImpact: 'API may not be able to serve lists',
            technicalSummary: 'Tries to fetch a list',
            panicGuide: 'Don\'t Panic',
            type: 'capi',
            capiMethod: 'lists',
            capiOptions: {
                uuid: listUuid
            }
        },
        {
            name: 'Page',
            severity: 2,
            businessImpact: 'API may not be able to serve pages',
            technicalSummary: 'Tries to fetch a page',
            panicGuide: 'Don\'t Panic',
            type: 'capi',
            capiMethod: 'pages',
            capiOptions: {
                uuid: pageUuid
            }
        },
    ]
}
