# News Aggregator Feature

This feature provides a comprehensive news aggregation system with support for both Global and Nepali news sources.

## Features

### Global News
- **Sources**: BBC, Reuters, Associated Press, CNN, Al Jazeera, The Guardian, NPR
- **Categories**: International, Technology, Business, Science, Health
- **Features**: 
  - Real-time RSS feed parsing
  - Article filtering by category and search
  - Responsive design with image support
  - Load more functionality
  - Article metadata (source, date, category)

### Nepali News
- **Sources**: Kantipur, Himalayan Times, Kathmandu Post, Republica, Online Khabar, Setopati
- **Categories**: General, Business, Politics, Sports
- **Features**:
  - Bilingual support (English/Nepali)
  - Same functionality as Global News
  - Local news source optimization

## Components

### Core Components
- `RSSParser.js` - Utility class for fetching and parsing RSS feeds
- `NewsArticle.js` - Reusable component for displaying individual articles
- `NewsFilter.js` - Component for filtering and searching articles
- `NewsLoadingStates.js` - Loading, skeleton, and error state components

### Pages
- `GlobalNews.js` - Main page for international news
- `NepaliNews.js` - Main page for Nepali news

### Configuration
- `NewsFeeds.js` - Configuration file containing all RSS feed URLs and metadata

## Technical Implementation

### RSS Feed Parsing
- Uses `allorigins.win` as CORS proxy for RSS feeds
- Supports multiple RSS feed formats
- Handles image extraction from various sources
- Error handling for failed feeds
- Rate limiting and batch processing

### Features
- **Search**: Full-text search across titles, descriptions, and source names
- **Filtering**: Category-based filtering
- **Pagination**: Load more functionality with configurable page sizes
- **Responsive Design**: Mobile-first design with grid layout
- **Error Handling**: Comprehensive error states with retry functionality
- **Loading States**: Skeleton loading and proper loading indicators

### Performance Optimizations
- Article caching
- Lazy loading of images
- Debounced search
- Efficient DOM updates

## Usage

### Navigation
- Access via Tools page → News Aggregator → Global News/Nepali News
- Direct URLs: `/global-news` and `/nepali-news`

### Configuration
To add new news sources, edit `src/Config/NewsFeeds.js`:

```javascript
export const globalNewsFeeds = [
  {
    name: 'Source Name',
    url: 'https://example.com/rss',
    category: 'Category'
  }
];
```

### Customization
- Modify RSS sources in `NewsFeeds.js`
- Adjust styling in individual components
- Configure load limits and pagination in page components

## Troubleshooting

### Common Issues
1. **CORS Errors**: RSS feeds are accessed via CORS proxy
2. **Feed Format**: Some feeds may have different XML structures
3. **Image Loading**: Images may fail to load due to external restrictions

### Error Handling
- Failed feeds are skipped without breaking the entire aggregation
- Network errors show retry buttons
- Invalid XML is handled gracefully

## Dependencies
- React Router for navigation
- Styled Components for styling
- Native DOM APIs for XML parsing
- Fetch API for HTTP requests

## Browser Compatibility
- Modern browsers with ES6+ support
- Fetch API support required
- DOMParser support required