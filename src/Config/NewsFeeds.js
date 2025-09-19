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
    name: 'BBC Nepali',
    url: 'https://feeds.bbci.co.uk/nepali/rss.xml',
    category: 'General'
  },
  {
    name: 'Setopati',
    url: 'https://www.setopati.com/feed',
    category: 'General'
  },
  {
    name: 'Ratopati',
    url: 'https://ratopati.com/feed',
    category: 'General'
  },
  {
    name: 'Ujyaalo Online',
    url: 'https://ujyaaloonline.com/feed',
    category: 'General'
  },
  {
    name: 'Gorkhapatra Online',
    url: 'https://gorkhapatraonline.com/feed',
    category: 'General'
  },
  {
    name: 'Nagarik News',
    url: 'https://nagariknews.nagariknetwork.com/feed',
    category: 'General'
  },
  {
    name: 'Online Khabar',
    url: 'https://www.onlinekhabar.com/feed',
    category: 'General'
  },
  {
    name: 'Kantipur Daily',
    url: 'https://ekantipur.com/feed',
    category: 'General'
  },
  {
    name: 'Annapurna Post',
    url: 'https://annapurnapost.com/feed/',
    category: 'General'
  },
  {
    name: 'Bahrakhari',
    url: 'https://www.12khari.com/feed/',
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