import { ChakraProvider, Box, CSSReset } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/LandingPage';
import { UserPage } from './pages/UserPage';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { CreateThread } from './components/CreateThread';
import { ThreadDetail } from './components/ThreadDetail';
import { Navigation } from './components/Navigation';
import type { ReactElement } from 'react';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <CSSReset />
        <AuthProvider>
          <BrowserRouter>
            <Box minH="100vh" bg="gray.50">
              <Navigation />
              <Box as="main">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/user" element={<UserPage />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/threads/new" element={<CreateThread />} />
                  <Route path="/threads/:id" element={<ThreadDetail />} />
                  <Route path="*" element={<LandingPage />} />
                </Routes>
              </Box>
            </Box>
          </BrowserRouter>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
