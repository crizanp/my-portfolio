import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import RSSFetcher from '../Utils/RSSFetcher';
import { nepaliNewsFeeds, newsCategories } from '../Config/NewsFeeds';
import { fallbackNepaliNews } from '../Config/FallbackNews';
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

const SourcesInfo = styled.div`
  background: rgba(${props => props.theme.highlight.rgb.primary}, 0.08);
  padding: 25px;
  border-radius: 15px;
  margin: 30px 0;
  text-align: center;
  border: 1px solid rgba(${props => props.theme.highlight.rgb.primary}, 0.15);
`;

const SourcesTitle = styled.h3`
  color: rgb(${props => props.theme.title.primary});
  margin-bottom: 15px;
  font-weight: 700;
`;

const SourcesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 15px;
`;

const SourceTag = styled.span`
  background: linear-gradient(45deg, ${props => props.theme.highlight.primary}, ${props => props.theme.colors.deepskyblue});
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(${props => props.theme.highlight.rgb.primary}, 0.3);
`;

const NepaliNews = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(12);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const rssFetcher = new RSSFetcher();

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching Nepali news...');
      const result = await rssFetcher.fetchMultipleFeeds(nepaliNewsFeeds);
      
      if (result.articles.length === 0) {
        console.warn('No articles fetched, using fallback data');
        setArticles(fallbackNepaliNews);
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
      setArticles(fallbackNepaliNews);
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
          <NewsTitle>नेपाली समाचार</NewsTitle>
          <NewsSubtitle>
            विश्वसनीय नेपाली समाचार स्रोतहरूबाट नवीनतम समाचारहरू प्राप्त गर्नुहोस्
          </NewsSubtitle>
        </NewsHeader>
        <NewsLoading message="नेपाली समाचार लोड गर्दै..." />
        <NewsSkeleton count={6} />
      </NewsContainer>
    );
  }

  if (error && articles.length === 0) {
    return (
      <NewsContainer>
        <NewsHeader>
          <NewsTitle>नेपाली समाचार</NewsTitle>
          <NewsSubtitle>
            विश्वसनीय नेपाली समाचार स्रोतहरूबाट नवीनतम समाचारहरू प्राप्त गर्नुहोस्
          </NewsSubtitle>
        </NewsHeader>
        <NewsError message={error} onRetry={fetchNews} />
      </NewsContainer>
    );
  }

  return (
    <NewsContainer>
      <NewsHeader>
        <NewsTitle>🇳🇵 नेपाली समाचार</NewsTitle>
        {/* Minimal subtitle removed to keep the page focused on news */}
        <HeaderActions>
          <RefreshButton onClick={handleRefresh}>
            🔄 Refresh समाचार
          </RefreshButton>
        </HeaderActions>
      </NewsHeader>

      {/* <StatsContainer>
        <StatItem>
          <StatNumber>{articles.length}</StatNumber>
          <StatLabel>कुल समाचारहरू</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{nepaliNewsFeeds.length}</StatNumber>
          <StatLabel>समाचार स्रोतहरू</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{newsCategories.nepali.length}</StatNumber>
          <StatLabel>श्रेणीहरू</StatLabel>
        </StatItem>
        {lastUpdated && (
          <StatItem>
            <StatNumber>{lastUpdated.toLocaleTimeString()}</StatNumber>
            <StatLabel>अन्तिम अपडेट</StatLabel>
          </StatItem>
        )}
      </StatsContainer> */}

  <SourcesInfo>
        <SourcesTitle>समाचार स्रोतहरू</SourcesTitle>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          हामी नेपालका प्रमुख र विश्वसनीय समाचार संस्थानहरूबाट समाचार संकलन गर्छौं
        </p>
        <SourcesList>
          {nepaliNewsFeeds.map(feed => (
            <SourceTag key={feed.name}>{feed.name}</SourceTag>
          ))}
        </SourcesList>
      </SourcesInfo>

      {/* Compact filter: hidden by default, shown via toggle to save vertical space */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 10 }}>
        <button
          onClick={() => setShowFilter(prev => !prev)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '10px 16px',
            borderRadius: 999,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {showFilter ? 'Hide Filters' : 'Filters'}
        </button>
      </div>

      {showFilter && (
        <div style={{ maxWidth: 920, margin: '0 auto 24px' }}>
          <NewsFilter
            compact
            categories={newsCategories.nepali}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultsCount={filteredArticles.length}
            totalCount={articles.length}
          />
        </div>
      )}

      <NewsGrid>
        {displayedArticles.map((article, index) => (
          <NewsArticle key={`${article.guid || article.link}-${index}`} article={article} />
        ))}
      </NewsGrid>

      {filteredArticles.length === 0 && !loading && (
        <NewsError 
          message="कुनै समाचार फेला परेन" 
          onRetry={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }} 
        />
      )}

      {hasMore && (
        <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
          {loading ? 'लोड गर्दै...' : `थप लोड गर्नुहोस् (${filteredArticles.length - displayCount} बाँकी)`}
        </LoadMoreButton>
      )}
    </NewsContainer>
  );
};

export default NepaliNews;