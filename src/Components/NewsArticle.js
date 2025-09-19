import React from 'react';
import styled from 'styled-components';

const NewsCard = styled.div`
  background: ${props => props.theme.bg.primary};
  border: 1px solid rgba(${props => props.theme.highlight.rgb.primary}, 0.1);
  padding: 15px;
  margin-bottom: 0;
  height: fit-content;
  display: flex;
  flex-direction: column;
`;


const NewsTitle = styled.h3`
  color: rgb(${props => props.theme.title.primary});
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.3;
  flex-grow: 1;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: ${props => props.theme.highlight.primary};
    }
  }
`;


const NewsMetadata = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.7rem;
`;

const NewsSource = styled.span`
  color: ${props => props.theme.highlight.primary};
  font-weight: 600;
  font-size: 0.7rem;
`;

const NewsDate = styled.span`
  color: ${props => props.theme.colors.grey};
  font-size: 0.7rem;
`;

const ReadMoreButton = styled.a`
  color: ${props => props.theme.highlight.primary};
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: auto;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NewsArticle = ({ article }) => {
  return (
    <NewsCard>
      <NewsMetadata>
        <NewsDate>{article.formattedDate}</NewsDate>
      </NewsMetadata>
      
      <NewsTitle>
        <a href={article.link} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </NewsTitle>
      
      <ReadMoreButton 
        href={article.link} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Read More →
      </ReadMoreButton>
    </NewsCard>
  );
};

export default NewsArticle;