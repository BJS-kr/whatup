import {
  ChakraProvider,
  Box,
  CSSReset,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigation } from './components/Navigation';
import type { ReactElement } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Suspense, lazy } from 'react';

// Lazy load components for better performance
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({
    default: module.LandingPage,
  })),
);
const UserPage = lazy(() =>
  import('./pages/UserPage').then((module) => ({ default: module.UserPage })),
);
const Notices = lazy(() =>
  import('./pages/Notices').then((module) => ({ default: module.Notices })),
);
const SignIn = lazy(() =>
  import('./components/auth/SignIn').then((module) => ({
    default: module.SignIn,
  })),
);
const SignUp = lazy(() =>
  import('./components/auth/SignUp').then((module) => ({
    default: module.SignUp,
  })),
);
const CreateThread = lazy(() =>
  import('./components/CreateThread').then((module) => ({
    default: module.CreateThread,
  })),
);
const ThreadDetail = lazy(() =>
  import('./components/ThreadDetail').then((module) => ({
    default: module.ThreadDetail,
  })),
);
const PendingContents = lazy(() =>
  import('./components/PendingContents').then((module) => ({
    default: module.PendingContents,
  })),
);

// Loading component
const LoadingSpinner = () => (
  <Center h="200px">
    <Spinner size="lg" color="orange.500" />
  </Center>
);

const queryClient = new QueryClient();

function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <CSSReset />
        <AuthProvider>
          <BrowserRouter>
            <Box
              minH="100vh"
              backgroundImage="url('/background.webp')"
              backgroundSize="cover"
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
              backgroundAttachment="fixed"
              style={{
                willChange: 'auto',
                transform: 'translateZ(0)', // Force hardware acceleration
              }}
            >
              <Navigation />
              <Box as="main">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/user" element={<UserPage />} />
                    <Route path="/notices" element={<Notices />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/threads/new" element={<CreateThread />} />
                    <Route path="/threads/:id" element={<ThreadDetail />} />
                    <Route
                      path="/threads/:id/pending"
                      element={<PendingContents />}
                    />
                    <Route path="*" element={<LandingPage />} />
                  </Routes>
                </Suspense>
              </Box>
            </Box>
          </BrowserRouter>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
