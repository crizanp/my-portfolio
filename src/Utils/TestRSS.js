// Test RSS feeds for debugging
import RSSParser from './RSSParser';

export const testRSSFeeds = async () => {
  const parser = new RSSParser();
  
  // Simple RSS feeds that are known to work
  const testFeeds = [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.cnn.com/rss/edition.rss'
  ];
  
  for (const feedUrl of testFeeds) {
    try {
      console.log(`Testing RSS feed: ${feedUrl}`);
      const articles = await parser.fetchRSSFeed(feedUrl);
      console.log(`✅ ${feedUrl} - Got ${articles.length} articles`);
      console.log('Sample article:', articles[0]);
    } catch (error) {
      console.error(`❌ ${feedUrl} - Error:`, error.message);
    }
  }
};

// Call this function in browser console to test
window.testRSSFeeds = testRSSFeeds;