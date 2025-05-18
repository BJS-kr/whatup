import { ChakraProvider, Box, CSSReset } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThreadList } from './components/ThreadList';
import { UserPage } from './pages/UserPage';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { CreateThread } from './components/CreateThread';
import { ThreadDetail } from './components/ThreadDetail';
import type { ReactElement } from 'react';
import { keyframes } from '@emotion/react';

const queryClient = new QueryClient();

const floatingAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 0.5; }
`;

function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <CSSReset />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ThreadList />} />
            <Route path="/user" element={<UserPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/threads/new" element={<CreateThread />} />
            <Route path="/threads/:id" element={<ThreadDetail />} />
            <Route path="*" element={<ThreadList />} />
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
