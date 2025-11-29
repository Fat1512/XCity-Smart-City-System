import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  maxWidth: 400,
  width: '100%',
}));

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <StyledContainer maxWidth="sm">
      <StyledPaper elevation={6}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {children}
      </StyledPaper>
    </StyledContainer>
  );
};

export default AuthLayout;