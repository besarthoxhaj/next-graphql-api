import getBranding from 'ft-n-article-branding';

import toLegacyTag from './legacy-tag';
import tap from '../tap';

export default class {
	constructor (articles) {
		this.articles = articles;
	}

	distinct (articles) {
		const distinctTopics = {};

		articles.forEach(article => {
			const metaData = article.signals.followed.tags.map(toLegacyTag);

			if (!metaData) {
				return;
			}

			metaData.forEach(theme => {
				!distinctTopics[theme.id] && (distinctTopics[theme.id] = {
					term: theme,
					items: []
				});
				distinctTopics[theme.id].items.push(article);

			});
		});

		return distinctTopics;
	}

	sort (topics) {
		const sortedTopics = Object.keys(topics).sort((a, b) => {
			if (topics[a].items.length < topics[b].items.length) {
				return 1;
			}

			if (topics[a].items.length > topics[b].items.length) {
				return -1;
			}

			const dateA = new Date(topics[a].items[0].contentTimeStamp).getTime();
			const dateB = new Date(topics[b].items[0].contentTimeStamp).getTime();

			if (dateA < dateB) {
				return 1;
			}

			if (dateA > dateB) {
				return -1;
			}

			return 0;
		});

		return sortedTopics.map(topicId => topics[topicId]);
	}

	images (topic) {
		let result;

		topic.items.some(item => {
			result = item.content && item.content.mainImage;
			return result;
		});
		topic.mainImage = result;

		return topic;
	}


	pluck (topics) {
		return topics.map(tap(topic => topic.items = topic.items.slice(0, 4)));
	}

	articleModel (topic) {
		topic.items = topic.items.map(article => {
			return {
				id: article.content.id,
				title: article.content.title ? article.content.title : '',
				datePublished: article.content.publishedDate,
				images: article.content.mainImage,
				brand: toLegacyTag(getBranding(article.content.metadata)),
				referrerTracking: `?myftTopics=${encodeURIComponent(topic.term.id)}#myft:my-news:grid`
			};
		});

		return topic;
	}

	process () {
		const topics = this.sort(this.distinct(this.articles));

		topics.forEach(topic => {
			this.images(topic);
			this.articleModel(topic);
			topic.isFollowing = true;
			topic.template = 'dashboard/followed-topic';
		});

		return this.pluck(topics);
	}
}
