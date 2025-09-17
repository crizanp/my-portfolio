// Alternative RSS fetcher using RSS-to-JSON services
class RSSFetcher {
  constructor() {
    // Free RSS-to-JSON APIs that work without CORS issues
    this.apis = [
      {
        name: 'RSS2JSON',
        baseUrl: 'https://api.rss2json.com/v1/api.json?rss_url=',
        transform: this.transformRSS2JSON.bind(this)
      },
      {
        name: 'RSS-to-JSON API',
        baseUrl: 'https://rss-to-json-serverless-api.vercel.app/api?feedURL=',
        transform: this.transformRSSToJSON.bind(this)
      }
    ];
    this.currentApiIndex = 0;
  }

  get currentApi() {
    return this.apis[this.currentApiIndex];
  }

  async fetchFeed(url) {
    let lastError = null;
    
    // Try different APIs
    for (let i = 0; i < this.apis.length; i++) {
      this.currentApiIndex = i;
      try {
        console.log(`Trying RSS API ${i + 1}/${this.apis.length}: ${this.currentApi.name}`);
        return await this.fetchWithApi(url);
      } catch (error) {
        console.warn(`RSS API ${i + 1} failed:`, error.message);
        lastError = error;
      }
    }
    
    throw lastError || new Error('All RSS APIs failed');
  }

  async fetchWithApi(url) {
    const apiUrl = `${this.currentApi.baseUrl}${encodeURIComponent(url)}`;
    console.log('Fetching from RSS API:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.currentApi.transform(data);
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
    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
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