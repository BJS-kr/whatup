import { ChakraProvider, Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThreadList } from './components/ThreadList';
import { ThreadDetail } from './components/ThreadDetail';
import { CreateThread } from './components/CreateThread';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <ThreadList />,
  },
  {
    path: '/threads/:id',
    element: <ThreadDetail />,
  },
  {
    path: '/threads/new',
    element: <CreateThread />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
]);

function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Box
          minH="100vh"
          position="relative"
          overflow="hidden"
          bgGradient="linear(to-br, purple.50, orange.50, blue.50)"
          _before={{
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(255, 182, 193, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(147, 112, 219, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(135, 206, 235, 0.15) 0%, transparent 50%)
            `,
            backgroundSize: '100% 100%',
            animation: `${pulseAnimation} 15s ease-in-out infinite`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
          _after={{
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            `,
            opacity: 0.5,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <Box
            position="relative"
            zIndex={1}
            sx={{
              '&::before': {
                content: '""',
                position: 'fixed',
                top: '10%',
                left: '10%',
                width: '300px',
                height: '300px',
                background:
                  'radial-gradient(circle, rgba(255,182,193,0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: `${floatingAnimation} 8s ease-in-out infinite`,
                zIndex: 0,
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'fixed',
                bottom: '10%',
                right: '10%',
                width: '400px',
                height: '400px',
                background:
                  'radial-gradient(circle, rgba(147,112,219,0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: `${floatingAnimation} 12s ease-in-out infinite reverse`,
                zIndex: 0,
                pointerEvents: 'none',
              },
            }}
          >
            <RouterProvider router={router} />
          </Box>
        </Box>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
