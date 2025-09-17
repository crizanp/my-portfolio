import React from 'react';
import styled from 'styled-components';

const NewsCard = styled.div`
  background: ${props => props.theme.bg.primary};
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.4s ease;
  border: 1px solid rgba(${props => props.theme.highlight.rgb.primary}, 0.1);
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border-color: rgba(${props => props.theme.highlight.rgb.primary}, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.highlight.primary}, ${props => props.theme.colors.deepskyblue});
  }
`;

const NewsImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const NewsTitle = styled.h3`
  color: rgb(${props => props.theme.title.primary});
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.5;
  
  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${props => props.theme.highlight.primary};
    }
  }
`;

const NewsDescription = styled.p`
  color: ${props => props.theme.colors.grey};
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 20px;
  font-weight: 400;
`;

const NewsMetadata = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
`;

const NewsSource = styled.span`
  color: ${props => props.theme.highlight.primary};
  font-weight: 700;
  font-size: 0.9rem;
  background: rgba(${props => props.theme.highlight.rgb.primary}, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(${props => props.theme.highlight.rgb.primary}, 0.3);
`;

const NewsDate = styled.span`
  color: ${props => props.theme.colors.grey};
  font-size: 0.85rem;
  font-weight: 500;
`;

const NewsCategory = styled.span`
  background: linear-gradient(45deg, ${props => props.theme.colors.deepskyblue}, ${props => props.theme.highlight.primary});
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReadMoreButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(45deg, ${props => props.theme.highlight.primary}, ${props => props.theme.colors.deepskyblue});
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(${props => props.theme.highlight.rgb.primary}, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(${props => props.theme.highlight.rgb.primary}, 0.4);
    text-decoration: none;
    color: white;
  }

  &::after {
    content: '→';
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(4px);
  }
`;

const NewsArticle = ({ article }) => {
  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <NewsCard>
      {article.image && (
        <NewsImage 
          src={article.image} 
          alt={article.title}
          onError={handleImageError}
        />
      )}
      
      <NewsMetadata>
        <NewsSource>{article.sourceName || article.source}</NewsSource>
        {article.sourceCategory && (
          <NewsCategory>{article.sourceCategory}</NewsCategory>
        )}
        <NewsDate>{article.formattedDate}</NewsDate>
      </NewsMetadata>
      
      <NewsTitle>
        <a href={article.link} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </NewsTitle>
      
      {article.description && (
        <NewsDescription>{article.description}</NewsDescription>
      )}
      
      <ReadMoreButton 
        href={article.link} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Read Full Article
      </ReadMoreButton>
    </NewsCard>
  );
};

export default NewsArticle;