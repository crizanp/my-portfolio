// RSS Feed utility for parsing news feeds
class RSSParser {
  constructor() {
    // Alternative CORS proxies to try
    this.proxies = [
      'https://api.allorigins.win/get?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.codetabs.com/v1/proxy?quest='
    ];
    this.currentProxyIndex = 0;
  }

  get corsProxy() {
    return this.proxies[this.currentProxyIndex];
  }

  async fetchRSSFeed(url) {
    let lastError = null;
    
    // Try different proxies
    for (let i = 0; i < this.proxies.length; i++) {
      this.currentProxyIndex = i;
      try {
        console.log(`Trying proxy ${i + 1}/${this.proxies.length}: ${this.corsProxy}`);
        return await this.fetchWithProxy(url);
      } catch (error) {
        console.warn(`Proxy ${i + 1} failed:`, error.message);
        lastError = error;
      }
    }
    
    throw lastError || new Error('All proxies failed');
  }

  async fetchWithProxy(url) {
    console.log('Fetching RSS feed:', url);
    
    let proxyUrl;
    let responseProcessor;
    
    if (this.corsProxy.includes('allorigins')) {
      proxyUrl = `${this.corsProxy}${encodeURIComponent(url)}`;
      responseProcessor = async (response) => {
        const data = await response.json();
        if (!data.contents) {
          throw new Error('No content received from RSS feed');
        }
        return data.contents;
      };
    } else {
      proxyUrl = `${this.corsProxy}${encodeURIComponent(url)}`;
      responseProcessor = async (response) => {
        return await response.text();
      };
    }
    
    console.log('Proxy URL:', proxyUrl);
    
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const content = await responseProcessor(response);
    console.log('Content length:', content.length);
    
    return this.parseXML(content);
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
          author: this.getAuthor(item),
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

  getAuthor(item) {
    // Try different author formats
    let author = '';
    
    // Standard author tag
    const authorElement = item.querySelector('author');
    if (authorElement) {
      author = authorElement.textContent.trim();
    }
    
    // Try Dublin Core creator (using getElementsByTagName to handle namespaces)
    if (!author) {
      const creatorElements = item.getElementsByTagName('creator');
      if (creatorElements.length > 0) {
        author = creatorElements[0].textContent.trim();
      }
    }
    
    // Try dc:creator specifically
    if (!author) {
      const dcCreatorElements = item.getElementsByTagName('dc:creator');
      if (dcCreatorElements.length > 0) {
        author = dcCreatorElements[0].textContent.trim();
      }
    }
    
    return author || 'Unknown Author';
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
    console.log(`Starting to fetch ${feedUrls.length} feeds...`);
    const promises = feedUrls.map(async (feedConfig) => {
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

export default RSSParser;