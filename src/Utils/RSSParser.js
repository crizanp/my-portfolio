// RSS Feed utility for parsing news feeds
class RSSParser {
  constructor() {
    // CORS proxy for RSS feeds - using allorigins.me as a reliable proxy
    this.corsProxy = 'https://api.allorigins.win/get?url=';
  }

  async fetchRSSFeed(url) {
    try {
      const proxyUrl = `${this.corsProxy}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No content received from RSS feed');
      }
      
      return this.parseXML(data.contents);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      throw error;
    }
  }

  parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('XML parsing error');
    }

    const items = xmlDoc.querySelectorAll('item');
    const articles = [];

    items.forEach((item, index) => {
      if (index < 20) { // Limit to 20 articles per feed
        const article = {
          title: this.getTextContent(item, 'title'),
          description: this.getTextContent(item, 'description'),
          link: this.getTextContent(item, 'link'),
          pubDate: this.getTextContent(item, 'pubDate'),
          author: this.getTextContent(item, 'author') || this.getTextContent(item, 'dc:creator'),
          category: this.getTextContent(item, 'category'),
          guid: this.getTextContent(item, 'guid'),
          image: this.getImageUrl(item),
          source: this.getChannelTitle(xmlDoc)
        };
        
        // Clean description and remove HTML tags
        article.description = this.cleanDescription(article.description);
        
        // Format date
        article.formattedDate = this.formatDate(article.pubDate);
        
        articles.push(article);
      }
    });

    return articles;
  }

  getTextContent(item, tagName) {
    const element = item.querySelector(tagName);
    return element ? element.textContent.trim() : '';
  }

  getChannelTitle(xmlDoc) {
    const titleElement = xmlDoc.querySelector('channel > title');
    return titleElement ? titleElement.textContent.trim() : 'Unknown Source';
  }

  getImageUrl(item) {
    // Try different image sources
    let imageUrl = '';
    
    // Try media:thumbnail
    const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
    if (mediaThumbnail) {
      imageUrl = mediaThumbnail.getAttribute('url');
    }
    
    // Try enclosure with image type
    if (!imageUrl) {
      const enclosure = item.querySelector('enclosure');
      if (enclosure && enclosure.getAttribute('type')?.includes('image')) {
        imageUrl = enclosure.getAttribute('url');
      }
    }
    
    // Try to extract image from description
    if (!imageUrl) {
      const description = this.getTextContent(item, 'description');
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }
    
    return imageUrl;
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
    const promises = feedUrls.map(async (feedConfig) => {
      try {
        const articles = await this.fetchRSSFeed(feedConfig.url);
        return articles.map(article => ({
          ...article,
          sourceName: feedConfig.name,
          sourceCategory: feedConfig.category
        }));
      } catch (error) {
        console.error(`Error fetching ${feedConfig.name}:`, error);
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    const allArticles = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    // Sort by publication date (newest first)
    return allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  }
}

export default RSSParser;