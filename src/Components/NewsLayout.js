import React from 'react';
import styled from 'styled-components';

const MinimalLayout = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${props => props.theme.bg.primary};
  padding: 0;
  margin: 0;
`;

const NewsLayout = ({ children }) => {
  return (
    <MinimalLayout>
      {children}
    </MinimalLayout>
  );
};

export default NewsLayout;