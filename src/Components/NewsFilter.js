import React, { useState } from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  background: ${props => props.theme.bg.primary};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.h3`
  color: rgb(${props => props.theme.title.primary});
  margin-bottom: 15px;
  font-size: 1.1rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? props.theme.highlight.primary : 'transparent'};
  color: ${props => props.active ? 'white' : `rgb(${props.theme.title.primary})`};
  border: 2px solid ${props => props.theme.highlight.primary};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.highlight.primary};
    color: white;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 10px 15px;
  border: 2px solid ${props => props.theme.colors.lightgrey};
  border-radius: 8px;
  font-size: 0.95rem;
  color: rgb(${props => props.theme.title.primary});
  background: ${props => props.theme.bg.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.highlight.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.grey};
  }
`;

const ResultsCount = styled.div`
  color: ${props => props.theme.colors.grey};
  font-size: 0.9rem;
  text-align: center;
  margin-top: 10px;
`;

const NewsFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  searchTerm, 
  onSearchChange,
  resultsCount,
  totalCount 
}) => {
  return (
    <FilterContainer>
      <FilterTitle>Filter News</FilterTitle>
      
      <FilterRow>
        <SearchInput
          type="text"
          placeholder="Search news articles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </FilterRow>
      
      <FilterRow>
        <FilterButton
          active={selectedCategory === 'all'}
          onClick={() => onCategoryChange('all')}
        >
          All Categories
        </FilterButton>
        {categories.map(category => (
          <FilterButton
            key={category}
            active={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </FilterButton>
        ))}
      </FilterRow>
      
      <ResultsCount>
        Showing {resultsCount} of {totalCount} articles
      </ResultsCount>
    </FilterContainer>
  );
};

export default NewsFilter;