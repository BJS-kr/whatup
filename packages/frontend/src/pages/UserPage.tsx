import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  useToast,
  Skeleton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import {
  useMyThreads,
  useOtherThreads,
  useLikedThreads,
  useTrendingThreads,
} from '../api/hooks';
import { ThreadList } from '../components/ThreadList';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export const UserPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, isLoading: isLoadingAuth, user } = useAuth();
  const {
    data: myThreads,
    isLoading: isLoadingMyThreads,
    error: myThreadsError,
  } = useMyThreads();
  const {
    data: otherThreads,
    isLoading: isLoadingOtherThreads,
    error: otherThreadsError,
  } = useOtherThreads();
  const {
    data: likedThreads,
    isLoading: isLoadingLikedThreads,
    error: likedThreadsError,
  } = useLikedThreads();
  const {
    data: trendingThreads,
    isLoading: isLoadingTrendingThreads,
    error: trendingThreadsError,
  } = useTrendingThreads();

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, isLoadingAuth, user });
    console.log('My threads:', {
      data: myThreads,
      isLoading: isLoadingMyThreads,
      error: myThreadsError,
    });
    console.log('Other threads:', {
      data: otherThreads,
      isLoading: isLoadingOtherThreads,
      error: otherThreadsError,
    });

    if (!isLoadingAuth && !isAuthenticated) {
      console.log('Not authenticated, redirecting to home');
      navigate('/');
    }
  }, [
    isLoadingAuth,
    isAuthenticated,
    navigate,
    myThreads,
    isLoadingMyThreads,
    myThreadsError,
    otherThreads,
    isLoadingOtherThreads,
    otherThreadsError,
    user,
  ]);

  const handleCreateThread = () => {
    navigate('/threads/new');
  };

  if (isLoadingAuth) {
    console.log('Loading auth state');
    return (
      <Container maxW="container.xl" py={8}>
        <Stack spacing={8}>
          <Skeleton height="40px" />
          <Skeleton height="200px" />
          <Skeleton height="200px" />
        </Stack>
      </Container>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, returning null');
    return null;
  }

  console.log('Rendering user page');
  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box>
          <HStack justify="space-between" align="center" mb={6}>
            <Heading
              size="lg"
              color="rgba(255, 255, 255, 0.9)"
              textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
            >
              My Stories
            </Heading>
            <Button
              leftIcon={<Icon as={FaPlus} />}
              colorScheme="orange"
              onClick={handleCreateThread}
            >
              Create Story
            </Button>
          </HStack>
          <ThreadList
            threads={myThreads || []}
            isLoading={isLoadingMyThreads}
            type="my"
          />
        </Box>

        <Box>
          <Heading
            size="lg"
            mb={6}
            color="rgba(255, 255, 255, 0.9)"
            textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
          >
            Liked Stories
          </Heading>
          <ThreadList
            threads={likedThreads || []}
            isLoading={isLoadingLikedThreads}
            type="liked"
          />
        </Box>

        <Box>
          <Heading
            size="lg"
            mb={6}
            color="rgba(255, 255, 255, 0.9)"
            textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
          >
            Trending Stories
          </Heading>
          <ThreadList
            threads={trendingThreads || []}
            isLoading={isLoadingTrendingThreads}
            type="trending"
          />
        </Box>

        <Box>
          <Heading
            size="lg"
            mb={6}
            color="rgba(255, 255, 255, 0.9)"
            textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
          >
            All Stories
          </Heading>
          <ThreadList
            threads={otherThreads || []}
            isLoading={isLoadingOtherThreads}
            type="others"
          />
        </Box>
      </Stack>
    </Container>
  );
};
