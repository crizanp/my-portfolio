// Configuration for trusted news RSS feeds

export const globalNewsFeeds = [
  {
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    category: 'International'
  },
  {
    name: 'Reuters Top News',
    url: 'https://feeds.reuters.com/reuters/topNews',
    category: 'International'
  },
  {
    name: 'CNN Top Stories',
    url: 'https://rss.cnn.com/rss/edition.rss',
    category: 'International'
  },
  {
    name: 'The Guardian International',
    url: 'https://www.theguardian.com/international/rss',
    category: 'International'
  },
  {
    name: 'NPR News',
    url: 'https://feeds.npr.org/1001/rss.xml',
    category: 'International'
  },
  {
    name: 'BBC Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Technology'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology'
  },
  {
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'Business'
  },
  {
    name: 'BBC Science',
    url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    category: 'Science'
  },
  {
    name: 'BBC Health',
    url: 'https://feeds.bbci.co.uk/news/health/rss.xml',
    category: 'Health'
  }
];

export const nepaliNewsFeeds = [
  {
    name: 'Online Khabar English',
    url: 'https://english.onlinekhabar.com/feed',
    category: 'General'
  },
  {
    name: 'Ratopati English',
    url: 'http://english.ratopati.com/rss/',
    category: 'General'
  },
  {
    name: 'Lokaantar English',
    url: 'http://english.lokaantar.com/feed/',
    category: 'General'
  },
  {
    name: 'Kathmandu Tribune',
    url: 'http://kathmandutribune.com/feed/',
    category: 'General'
  },
  {
    name: 'Setopati English',
    url: 'https://en.setopati.com/feed',
    category: 'General'
  },
  {
    name: 'Nepali Times',
    url: 'https://www.nepalitimes.com/feed/',
    category: 'General'
  },
  {
    name: 'Telegraph Nepal',
    url: 'http://telegraphnepal.com/feed/',
    category: 'General'
  },
  {
    name: 'The Himalayan Times',
    url: 'https://thehimalayantimes.com/feed/',
    category: 'General'
  },
  {
    name: 'Nepal Online Patrika',
    url: 'https://nepalonlinepatrika.com/rss/latest-posts',
    category: 'General'
  },
  {
    name: 'Himalayan Times RSS',
    url: 'https://www.thehimalayantimes.com/rssFeed/15',
    category: 'General'
  }
];

export const newsCategories = {
  global: [
    'International',
    'Technology',
    'Business',
    'Science',
    'Health'
  ],
  nepali: [
    'General',
    'Business',
    'Politics',
    'Sports'
  ]
};