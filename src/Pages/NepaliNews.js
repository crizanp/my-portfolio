import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import RSSFetcher from '../Utils/RSSFetcher';
import { nepaliNewsFeeds, newsCategories } from '../Config/NewsFeeds';
import { fallbackNepaliNews } from '../Config/FallbackNews';
import NewsArticle from '../Components/NewsArticle';
import { NewsLoading, NewsSkeleton, NewsError } from '../Components/NewsLoadingStates';

const NewsContainer = styled.div`
  .card-inner {
    padding: 30px;
  }
`;

const NewsHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NewsTitle = styled.h1`
  color: rgb(${props => props.theme.title.primary});
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const RefreshButton = styled.button`
  background: ${props => props.theme.highlight.primary};
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 3px;

  &:hover {
    opacity: 0.8;
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 30px auto;
  background: ${props => props.theme.highlight.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background: ${props => props.theme.colors.grey};
    cursor: not-allowed;
  }
`;

const NepaliNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(9);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedsUsed, setFeedsUsed] = useState(6);

  const rssFetcher = new RSSFetcher();

  // Use first 6 feeds for good balance of speed and content
  const quickFeeds = nepaliNewsFeeds.slice(0, feedsUsed);

  const fetchNews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('Fetching Nepali news...');
      const result = await rssFetcher.fetchMultipleFeeds(quickFeeds);
      
      if (result.articles.length === 0) {
        console.warn('No articles fetched, using fallback data');
        // Create more diverse fallback data
        const diverseFallback = Array.from({length: 30}, (_, i) => ({
          title: `नमूना समाचार ${i + 1}: नेपालका मुख्य घटनाक्रमहरू`,
          description: `यो एक नमूना समाचार हो। वास्तविक समाचारका लागि कृपया पछि फर्केर हेर्नुहोस्।`,
          link: "#",
          pubDate: new Date(Date.now() - i * 3600000).toISOString(),
          author: "News Team",
          category: "General",
          guid: `sample-${i + 1}`,
          image: "",
          source: "Sample News",
          sourceName: "नमूना समाचार",
          sourceCategory: "General",
          formattedDate: new Date(Date.now() - i * 3600000).toLocaleDateString()
        }));
        setArticles(diverseFallback);
        if (result.errors.length > 0) {
          console.warn('Feed errors:', result.errors);
        }
      } else {
        setArticles(result.articles);
        if (result.errors.length > 0) {
          console.warn('Some feeds failed:', result.errors);
        }
      }
      
      setLastUpdated(new Date());
      console.log(`Fetched ${result.articles.length} articles`);
    } catch (err) {
      console.error('Error fetching news:', err);
      console.log('Using fallback data due to RSS error');
      // Create diverse fallback data for error case too
      const diverseFallback = Array.from({length: 30}, (_, i) => ({
        title: `नमूना समाचार ${i + 1}: नेपालका मुख्य घटनाक्रमहरू`,
        description: `यो एक नमूना समाचार हो। वास्तविक समाचारका लागि कृपया पछि फर्केर हेर्नुहोस्।`,
        link: "#",
        pubDate: new Date(Date.now() - i * 3600000).toISOString(),
        author: "News Team",
        category: "General",
        guid: `sample-error-${i + 1}`,
        image: "",
        source: "Sample News",
        sourceName: "नमूना समाचार",
        sourceCategory: "General",
        formattedDate: new Date(Date.now() - i * 3600000).toLocaleDateString()
      }));
      setArticles(diverseFallback);
      setError('RSS feeds temporarily unavailable. Showing fallback content.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // No filtering: show all fetched articles

  const handleLoadMore = () => {
    // If we're running low on articles and haven't used all feeds, fetch more
    if (articles.length - displayCount < 6 && feedsUsed < nepaliNewsFeeds.length) {
      setFeedsUsed(prev => Math.min(prev + 2, nepaliNewsFeeds.length));
      fetchNews(true);
    }
    setDisplayCount(prev => prev + 9);
  };

  const handleRefresh = () => {
    setDisplayCount(9);
    setFeedsUsed(6); // Reset to initial feed count
    fetchNews(true);
  };

  const displayedArticles = articles.slice(0, displayCount);
  const hasMore = displayCount < articles.length;

  if (loading && articles.length === 0) {
    return (
      <NewsContainer>
        <div className="card-inner">
          <div className="card-wrap">
            <NewsHeader>
              <NewsTitle>नेपाली समाचार</NewsTitle>
            </NewsHeader>
            <NewsLoading message="नेपाली समाचार लोड गर्दै..." />
          </div>
        </div>
      </NewsContainer>
    );
  }

  if (error && articles.length === 0) {
    return (
      <NewsContainer>
        <div className="card-inner">
          <div className="card-wrap">
            <NewsHeader>
              <NewsTitle>नेपाली समाचार</NewsTitle>
            </NewsHeader>
            <NewsError message={error} onRetry={fetchNews} />
          </div>
        </div>
      </NewsContainer>
    );
  }

  return (
    <NewsContainer>
      <div className="card-inner">
        <div className="card-wrap">
          <NewsHeader>
            <NewsTitle>नेपाली समाचार</NewsTitle>
            <RefreshButton onClick={handleRefresh} disabled={isLoadingMore}>
              {isLoadingMore ? '⟳' : 'Refresh'}
            </RefreshButton>
          </NewsHeader>

          <NewsGrid>
            {articles.slice(0, displayCount).map((article, index) => (
              <NewsArticle key={`${article.guid || article.link}-${index}`} article={article} />
            ))}
          </NewsGrid>

          {articles.length === 0 && !loading && (
            <NewsError 
              message="कुनै समाचार फेला परेन" 
              onRetry={() => {
                fetchNews();
              }} 
            />
          )}

          {articles.length > displayCount && (
            <LoadMoreButton onClick={handleLoadMore} disabled={loading || isLoadingMore}>
              {(loading || isLoadingMore) ? 'लोड गर्दै...' : `थप लोड गर्नुहोस् (${articles.length - displayCount} बाँकी)`}
            </LoadMoreButton>
          )}
        </div>
      </div>
    </NewsContainer>
  );
};

export default NepaliNews;