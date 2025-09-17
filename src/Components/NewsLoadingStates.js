import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${props => props.theme.colors.lightgrey};
  border-top: 4px solid ${props => props.theme.highlight.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.p`
  color: rgb(${props => props.theme.title.primary});
  font-size: 1.1rem;
  margin-bottom: 10px;
`;

const LoadingSubtext = styled.p`
  color: ${props => props.theme.colors.grey};
  font-size: 0.9rem;
`;

const SkeletonCard = styled.div`
  background: ${props => props.theme.bg.primary};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SkeletonElement = styled.div`
  background: linear-gradient(90deg, ${props => props.theme.colors.varylightgrey} 0px, rgba(229, 229, 229, 0.8) 40px, ${props => props.theme.colors.varylightgrey} 80px);
  background-size: 200px;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 4px;
  
  &.image {
    height: 200px;
    margin-bottom: 15px;
    border-radius: 8px;
  }
  
  &.title {
    height: 24px;
    width: 80%;
    margin-bottom: 10px;
  }
  
  &.description {
    height: 16px;
    width: 100%;
    margin-bottom: 8px;
  }
  
  &.metadata {
    height: 14px;
    width: 60%;
    margin-bottom: 15px;
  }
  
  &.button {
    height: 36px;
    width: 120px;
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: ${props => props.theme.bg.primary};
  border-radius: 12px;
  margin: 20px 0;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.fandango};
`;

const ErrorText = styled.h3`
  color: rgb(${props => props.theme.title.primary});
  margin-bottom: 10px;
`;

const ErrorSubtext = styled.p`
  color: ${props => props.theme.colors.grey};
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  background: ${props => props.theme.highlight.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.chambreyblue};
  }
`;

const NewsLoading = ({ message = "Loading latest news..." }) => (
  <LoadingContainer>
    <Spinner />
    <LoadingText>{message}</LoadingText>
    <LoadingSubtext>Fetching articles from trusted sources</LoadingSubtext>
  </LoadingContainer>
);

const NewsSkeleton = ({ count = 6 }) => (
  <SkeletonGrid>
    {Array.from({ length: count }, (_, index) => (
      <SkeletonCard key={index}>
        <SkeletonElement className="image" />
        <SkeletonElement className="metadata" />
        <SkeletonElement className="title" />
        <SkeletonElement className="description" />
        <SkeletonElement className="description" style={{ width: '70%' }} />
        <SkeletonElement className="button" />
      </SkeletonCard>
    ))}
  </SkeletonGrid>
);

const NewsError = ({ message = "Unable to load news", onRetry }) => (
  <ErrorContainer>
    <ErrorIcon>⚠️</ErrorIcon>
    <ErrorText>{message}</ErrorText>
    <ErrorSubtext>
      There was a problem fetching the latest news. Please check your internet connection and try again.
    </ErrorSubtext>
    {onRetry && (
      <RetryButton onClick={onRetry}>
        Try Again
      </RetryButton>
    )}
  </ErrorContainer>
);

export { NewsLoading, NewsSkeleton, NewsError };