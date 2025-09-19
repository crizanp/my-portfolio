// Alternative RSS fetcher using RSS-to-JSON services
class RSSFetcher {
  constructor() {
    // Multiple RSS-to-JSON APIs for better reliability
    this.apis = [
      {
        name: 'RSS2JSON',
        baseUrl: 'https://api.rss2json.com/v1/api.json?rss_url=',
        transform: this.transformRSS2JSON.bind(this),
        timeout: 8000
      },
      {
        name: 'AllOrigins Proxy',
        baseUrl: 'https://api.allorigins.win/get?url=',
        transform: this.transformAllOrigins.bind(this),
        timeout: 10000
      },
      {
        name: 'RSS Parse API',
        baseUrl: 'https://rss-parser-api.herokuapp.com/api?url=',
        transform: this.transformRSSParser.bind(this),
        timeout: 12000
      }
    ];
    this.currentApiIndex = 0;
    this.rateLimitDelay = 1000; // 1 second delay between requests
    this.lastRequestTime = 0;
  }

  get currentApi() {
    return this.apis[this.currentApiIndex];
  }

  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastRequestTime = Date.now();
  }

  async fetchFeed(url) {
    let lastError = null;
    
    // Wait to avoid rate limiting
    await this.waitForRateLimit();
    
    // Try different APIs
    for (let i = 0; i < this.apis.length; i++) {
      this.currentApiIndex = i;
      try {
        console.log(`Trying RSS API ${i + 1}/${this.apis.length}: ${this.currentApi.name}`);
        return await this.fetchWithApi(url);
      } catch (error) {
        console.warn(`RSS API ${i + 1} failed:`, error.message);
        lastError = error;
        
        // If rate limited, wait longer before trying next API
        if (error.message.includes('422') || error.message.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw lastError || new Error('All RSS APIs failed');
  }

  async fetchWithApi(url) {
    const apiUrl = `${this.currentApi.baseUrl}${encodeURIComponent(url)}`;
    console.log('Fetching from RSS API:', apiUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.currentApi.timeout);
    
    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NewsAggregator/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.currentApi.transform(data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  transformRSS2JSON(data) {
    if (data.status !== 'ok') {
      throw new Error('RSS2JSON API error: ' + (data.message || 'Unknown error'));
    }

    return data.items.slice(0, 20).map(item => ({
      title: item.title || 'No Title',
      description: this.cleanDescription(item.description || item.content || ''),
      link: item.link || '',
      pubDate: item.pubDate || '',
      author: item.author || 'Unknown Author',
      category: item.categories ? item.categories.join(', ') : '',
      guid: item.guid || item.link || '',
      image: item.thumbnail || this.extractImageFromContent(item.content || item.description || ''),
      source: data.feed?.title || 'News Source',
      formattedDate: this.formatDate(item.pubDate || '')
    }));
  }

  transformRSSToJSON(data) {
    if (!data.items) {
      throw new Error('RSS-to-JSON API error: No items found');
    }

    return data.items.slice(0, 20).map(item => ({
      title: item.title || 'No Title',
      description: this.cleanDescription(item.description || item.summary || ''),
      link: item.link || '',
      pubDate: item.published || item.pubDate || '',
      author: item.author || 'Unknown Author',
      category: item.category || '',
      guid: item.id || item.link || '',
      image: item.image || this.extractImageFromContent(item.description || ''),
      source: data.title || 'News Source',
      formattedDate: this.formatDate(item.published || item.pubDate || '')
    }));
  }

  transformAllOrigins(data) {
    try {
      // AllOrigins returns the raw content, need to parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      
      const items = xmlDoc.querySelectorAll('item');
      const articles = [];
      
      for (let i = 0; i < Math.min(items.length, 20); i++) {
        const item = items[i];
        const title = item.querySelector('title')?.textContent || 'No Title';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const author = item.querySelector('author')?.textContent || 'Unknown Author';
        const category = item.querySelector('category')?.textContent || '';
        
        articles.push({
          title,
          description: this.cleanDescription(description),
          link,
          pubDate,
          author,
          category,
          guid: link || `item-${i}`,
          image: this.extractImageFromContent(description),
          source: xmlDoc.querySelector('channel title')?.textContent || 'News Source',
          formattedDate: this.formatDate(pubDate)
        });
      }
      
      return articles;
    } catch (error) {
      throw new Error('AllOrigins XML parsing error: ' + error.message);
    }
  }

  transformRSSParser(data) {
    if (!data.feed || !data.feed.entries) {
      throw new Error('RSS Parser API error: No entries found');
    }

    return data.feed.entries.slice(0, 20).map((item, index) => ({
      title: item.title || 'No Title',
      description: this.cleanDescription(item.summary || item.content || ''),
      link: item.link || '',
      pubDate: item.published || item.updated || '',
      author: item.author || 'Unknown Author',
      category: item.tags ? item.tags.join(', ') : '',
      guid: item.id || item.link || `item-${index}`,
      image: this.extractImageFromContent(item.content || item.summary || ''),
      source: data.feed.title || 'News Source',
      formattedDate: this.formatDate(item.published || item.updated || '')
    }));
  }

  cleanDescription(description) {
    if (!description) return '';
    
    // Remove HTML tags
    let cleaned = description.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = cleaned;
    cleaned = textarea.value;
    
    // Truncate to reasonable length
    if (cleaned.length > 300) {
      cleaned = cleaned.substring(0, 300) + '...';
    }
    
    return cleaned.trim();
  }

  extractImageFromContent(content) {
    if (!content) return '';
    
    // Try to extract image URL from HTML content
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      return imgMatch[1];
    }
    
    // Try to find image URLs in text
    const urlMatch = content.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    return '';
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown Date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown Date';
    }
  }

  async fetchMultipleFeeds(feeds) {
    const maxConcurrentRequests = 3; // Limit concurrent requests to avoid rate limiting
    const results = [];
    
    // Process feeds in batches
    for (let i = 0; i < feeds.length; i += maxConcurrentRequests) {
      const batch = feeds.slice(i, i + maxConcurrentRequests);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (feed) => {
          try {
            const articles = await this.fetchFeed(feed.url);
            return {
              success: true,
              feedName: feed.name,
              articles: articles.map(article => ({
                ...article,
                feedCategory: feed.category || 'General'
              }))
            };
          } catch (error) {
            console.error(`Failed to fetch ${feed.name}:`, error);
            return {
              success: false,
              feedName: feed.name,
              error: error.message,
              articles: []
            };
          }
        })
      );
      
      results.push(...batchResults);
      
      // Add delay between batches to avoid overwhelming APIs
      if (i + maxConcurrentRequests < feeds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const allArticles = [];
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const feedResult = result.value;
        if (feedResult.success) {
          allArticles.push(...feedResult.articles);
        } else {
          errors.push(`${feeds[index].name}: ${feedResult.error}`);
        }
      } else {
        errors.push(`${feeds[index].name}: ${result.reason.message}`);
      }
    });

    // Sort articles by date (newest first)
    allArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);
      return dateB - dateA;
    });

    return { articles: allArticles, errors };
  }
}

export default RSSFetcher;