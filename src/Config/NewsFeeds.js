// Configuration for trusted news RSS feeds

export const globalNewsFeeds = [
  {
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    category: 'International'
  },
  {
    name: 'Reuters Top News',
    url: 'https://feeds.reuters.com/reuters/topNews',
    category: 'International'
  },
  {
    name: 'Associated Press',
    url: 'https://feeds.apnews.com/rss/apf-topnews',
    category: 'International'
  },
  {
    name: 'CNN Top Stories',
    url: 'http://rss.cnn.com/rss/edition.rss',
    category: 'International'
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
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
    url: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Technology'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology'
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'Technology'
  },
  {
    name: 'BBC Business',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'Business'
  },
  {
    name: 'Bloomberg',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'Business'
  },
  {
    name: 'BBC Science',
    url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    category: 'Science'
  },
  {
    name: 'Scientific American',
    url: 'https://rss.sciam.com/ScientificAmerican-Global',
    category: 'Science'
  },
  {
    name: 'BBC Health',
    url: 'http://feeds.bbci.co.uk/news/health/rss.xml',
    category: 'Health'
  }
];

export const nepaliNewsFeeds = [
  {
    name: 'Kantipur Daily',
    url: 'https://ekantipur.com/rss',
    category: 'General'
  },
  {
    name: 'The Himalayan Times',
    url: 'https://thehimalayantimes.com/rss',
    category: 'General'
  },
  {
    name: 'Kathmandu Post',
    url: 'https://kathmandupost.com/rss',
    category: 'General'
  },
  {
    name: 'Republica',
    url: 'https://myrepublica.nagariknetwork.com/rss/',
    category: 'General'
  },
  {
    name: 'Online Khabar',
    url: 'https://www.onlinekhabar.com/feed',
    category: 'General'
  },
  {
    name: 'Setopati',
    url: 'https://setopati.com/rss',
    category: 'General'
  },
  {
    name: 'Nepal News',
    url: 'https://www.nepalnews.com/rss',
    category: 'General'
  },
  {
    name: 'Ratopati',
    url: 'https://ratopati.com/rss',
    category: 'General'
  },
  {
    name: 'Arthik Abhiyan',
    url: 'https://arthikabhiyan.com/rss',
    category: 'Business'
  },
  {
    name: 'Naya Patrika',
    url: 'https://www.nayapatrikadaily.com/rss',
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