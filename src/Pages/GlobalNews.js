import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import RSSFetcher from '../Utils/RSSFetcher';
import { globalNewsFeeds, newsCategories } from '../Config/NewsFeeds';
import { fallbackGlobalNews } from '../Config/FallbackNews';
import NewsArticle from '../Components/NewsArticle';
import NewsFilter from '../Components/NewsFilter';
import { NewsLoading, NewsSkeleton, NewsError } from '../Components/NewsLoadingStates';

const NewsContainer = styled.div`
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: ${props => props.theme.bg.primary};
  min-height: 100vh;
`;

const NewsHeader = styled.div`
  text-align: center;
  margin-bottom: 50px;
  padding: 60px 20px 40px;
  background: linear-gradient(135deg, ${props => props.theme.highlight.primary}15 0%, ${props => props.theme.colors.deepskyblue}10 100%);
  border-radius: 20px;
  margin-bottom: 40px;
`;

const NewsTitle = styled.h1`
  color: rgb(${props => props.theme.title.primary});
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(45deg, ${props => props.theme.highlight.primary}, ${props => props.theme.colors.deepskyblue});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const NewsSubtitle = styled.p`
  color: ${props => props.theme.colors.grey};
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 30px;
  line-height: 1.7;
  font-weight: 400;
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 30px;
  margin-top: 30px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 40px auto;
  background: ${props => props.theme.highlight.primary};
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.chambreyblue};
  }

  &:disabled {
    background: ${props => props.theme.colors.grey};
    cursor: not-allowed;
  }
`;

const RefreshButton = styled.button`
  background: ${props => props.theme.highlight.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(${props => props.theme.highlight.rgb.primary}, 0.3);

  &:hover {
    background: ${props => props.theme.colors.chambreyblue};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(${props => props.theme.highlight.rgb.primary}, 0.4);
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 40px 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 25px 20px;
  background: ${props => props.theme.bg.primary};
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(${props => props.theme.highlight.rgb.primary}, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatNumber = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${props => props.theme.highlight.primary};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: ${props => props.theme.colors.grey};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GlobalNews = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(12);
  const [lastUpdated, setLastUpdated] = useState(null);

  const rssFetcher = new RSSFetcher();

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching global news...');
      const result = await rssFetcher.fetchMultipleFeeds(globalNewsFeeds);
      
      if (result.articles.length === 0) {
        console.warn('No articles fetched, using fallback data');
        setArticles(fallbackGlobalNews);
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
      setArticles(fallbackGlobalNews);
      setError('RSS feeds temporarily unavailable. Showing fallback content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.sourceCategory === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower) ||
        article.sourceName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedCategory, searchTerm]);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  const handleRefresh = () => {
    setDisplayCount(12);
    fetchNews();
  };

  const displayedArticles = filteredArticles.slice(0, displayCount);
  const hasMore = displayCount < filteredArticles.length;

  if (loading && articles.length === 0) {
    return (
      <NewsContainer>
        <NewsHeader>
          <NewsTitle>Global News</NewsTitle>
          <NewsSubtitle>
            Stay informed with the latest news from trusted international sources
          </NewsSubtitle>
        </NewsHeader>
        <NewsLoading message="Loading global news..." />
        <NewsSkeleton count={6} />
      </NewsContainer>
    );
  }

  if (error && articles.length === 0) {
    return (
      <NewsContainer>
        <NewsHeader>
          <NewsTitle>Global News</NewsTitle>
          <NewsSubtitle>
            Stay informed with the latest news from trusted international sources
          </NewsSubtitle>
        </NewsHeader>
        <NewsError message={error} onRetry={fetchNews} />
      </NewsContainer>
    );
  }

  return (
    <NewsContainer>
      <NewsHeader>
        <NewsTitle>🌍 Global News</NewsTitle>
        <NewsSubtitle>
          Stay informed with the latest international news from trusted sources including BBC, Reuters, CNN, and more
        </NewsSubtitle>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh}>
            🔄 Refresh News
          </RefreshButton>
        </HeaderActions>
      </NewsHeader>

      <StatsContainer>
        <StatItem>
          <StatNumber>{articles.length}</StatNumber>
          <StatLabel>Total Articles</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{globalNewsFeeds.length}</StatNumber>
          <StatLabel>News Sources</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{newsCategories.global.length}</StatNumber>
          <StatLabel>Categories</StatLabel>
        </StatItem>
        {lastUpdated && (
          <StatItem>
            <StatNumber>{lastUpdated.toLocaleTimeString()}</StatNumber>
            <StatLabel>Last Updated</StatLabel>
          </StatItem>
        )}
      </StatsContainer>

      <NewsFilter
        categories={newsCategories.global}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultsCount={filteredArticles.length}
        totalCount={articles.length}
      />

      <NewsGrid>
        {displayedArticles.map((article, index) => (
          <NewsArticle key={`${article.guid || article.link}-${index}`} article={article} />
        ))}
      </NewsGrid>

      {filteredArticles.length === 0 && !loading && (
        <NewsError 
          message="No articles found" 
          onRetry={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }} 
        />
      )}

      {hasMore && (
        <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : `Load More (${filteredArticles.length - displayCount} remaining)`}
        </LoadMoreButton>
      )}
    </NewsContainer>
  );
};

export default GlobalNews;