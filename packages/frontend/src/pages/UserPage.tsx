import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { useThreads, useLikeThread, useSignOut } from '../api/hooks';
import { ThreadCard } from '../components/ThreadList';

export function UserPage() {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const { data: threads = [], isLoading, error } = useThreads();
  const likeThread = useLikeThread();

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    navigate('/');
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="flex-end" mb={8}>
        <Button
          leftIcon={<Icon as={FaSignOutAlt} />}
          colorScheme="red"
          variant="ghost"
          onClick={handleSignOut}
          _hover={{
            bg: 'red.50',
            transform: 'translateY(-2px)',
            shadow: 'md',
          }}
          transition="all 0.2s"
        >
          Sign Out
        </Button>
      </Flex>

      <Box
        p={8}
        borderRadius="xl"
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(10px)"
        borderWidth="1px"
        borderColor="purple.100"
        shadow="xl"
      >
        <VStack spacing={6} align="stretch">
          <Heading
            size="lg"
            bgGradient="linear(to-r, purple.600, pink.600)"
            bgClip="text"
            fontWeight="bold"
          >
            Your Threads
          </Heading>
          <Button
            colorScheme="purple"
            size="lg"
            leftIcon={<Icon as={FaPlus} />}
            onClick={() => navigate('/threads/new')}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg',
            }}
            transition="all 0.2s"
          >
            Create New Thread
          </Button>
          {isLoading ? (
            <Stack spacing={4}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  height="200px"
                  borderRadius="xl"
                  startColor="purple.100"
                  endColor="pink.100"
                />
              ))}
            </Stack>
          ) : error ? (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>
                Failed to load threads. Please try again later.
              </AlertDescription>
            </Alert>
          ) : threads.length === 0 ? (
            <Box
              p={8}
              textAlign="center"
              borderRadius="lg"
              bg="purple.50"
              borderWidth="1px"
              borderColor="purple.200"
            >
              <Text color="purple.600" fontSize="lg">
                You haven't created any threads yet. Start your first story now!
              </Text>
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns="repeat(auto-fit, minmax(450px, 1fr))"
              gap={6}
              justifyItems="center"
            >
              {threads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  onLike={() => likeThread.mutateAsync(thread.id)}
                />
              ))}
            </Box>
          )}
        </VStack>
      </Box>
    </Container>
  );
}
