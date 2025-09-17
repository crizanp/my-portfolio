// Alternative RSS parser using rss2json API
class SimpleRSSParser {
  constructor() {
    this.apiUrl = 'https://api.rss2json.com/v1/api.json';
  }

  async fetchRSSFeed(url) {
    try {
      console.log('Fetching RSS with rss2json:', url);
      const apiUrl = `${this.apiUrl}?rss_url=${encodeURIComponent(url)}&api_key=YOUR_API_KEY&count=20`;
      
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (data.status !== 'ok') {
        throw new Error(data.message || 'RSS feed error');
      }
      
      return this.formatArticles(data.items, data.feed);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      throw error;
    }
  }

  formatArticles(items, feedInfo) {
    return items.map((item, index) => ({
      title: item.title || 'No title',
      description: this.cleanDescription(item.description || item.content || ''),
      link: item.link || '#',
      pubDate: item.pubDate || new Date().toISOString(),
      author: item.author || feedInfo.title || 'Unknown',
      category: item.categories?.[0] || 'General',
      guid: item.guid || `item-${index}`,
      image: this.extractImage(item),
      source: feedInfo.title || 'Unknown Source',
      formattedDate: this.formatDate(item.pubDate)
    }));
  }

  extractImage(item) {
    // Try to get image from various fields
    if (item.enclosure?.type?.includes('image')) {
      return item.enclosure.link;
    }
    
    if (item.thumbnail) {
      return item.thumbnail;
    }
    
    // Extract from description
    if (item.description) {
      const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) {
        return imgMatch[1];
      }
    }
    
    return '';
  }

  cleanDescription(description) {
    if (!description) return '';
    
    // Remove HTML tags
    const cleanedDesc = description.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = cleanedDesc;
    const decoded = textarea.value;
    
    // Trim and limit length
    return decoded.trim().substring(0, 200) + (decoded.length > 200 ? '...' : '');
  }

  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  async fetchMultipleFeeds(feedUrls) {
    console.log(`Starting to fetch ${feedUrls.length} feeds with SimpleRSSParser...`);
    const promises = feedUrls.slice(0, 3).map(async (feedConfig) => { // Limit to 3 feeds for testing
      try {
        console.log(`Fetching ${feedConfig.name}...`);
        const articles = await this.fetchRSSFeed(feedConfig.url);
        console.log(`✅ ${feedConfig.name}: ${articles.length} articles`);
        return articles.map(article => ({
          ...article,
          sourceName: feedConfig.name,
          sourceCategory: feedConfig.category
        }));
      } catch (error) {
        console.error(`❌ ${feedConfig.name}:`, error.message);
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    const allArticles = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    console.log(`Total articles collected: ${allArticles.length}`);

    // Sort by publication date (newest first)
    return allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  }
}

export default SimpleRSSParser;