import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  VStack,
  Link as ChakraLink,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  HStack,
  useToast,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaHeart, FaPlus, FaChevronDown } from 'react-icons/fa';
import { Icon } from '@chakra-ui/react';
import { useThreads, useLikeThread, useSignIn } from '../api/hooks';
import type { Thread, ThreadContent } from '../api/types';
import { useState } from 'react';
import { motion } from 'framer-motion';

const createExampleContent = (
  id: string,
  threadId: string,
  content: string,
  authorName: string,
  authorEmoji: string,
): ThreadContent => ({
  id,
  authorId: authorName,
  threadId,
  status: 'ACCEPTED',
  like: 0,
  order: 1,
  content,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  authorEmoji,
});

const ExampleThreads: Thread[] = [
  {
    id: 'example-2',
    title: 'Mystery in the Old Mansion',
    description:
      'A thrilling mystery where each writer adds their own twist to the story.',
    threadContents: [
      createExampleContent(
        '1',
        'example-2',
        'The old mansion had stood empty for decades, its windows dark and its gardens overgrown. But tonight, a single light burned in the attic window. Detective Sarah Morgan pulled her coat tighter as she approached the creaking front door, her flashlight beam cutting through the misty night.',
        'Sarah Morgan',
        '🔍',
      ),
      createExampleContent(
        '2',
        'example-2',
        "Inside, the air was thick with dust and the smell of old paper. Sarah's footsteps echoed on the marble floor as she made her way to the grand staircase. That's when she heard it - the faint sound of music coming from somewhere above, a haunting melody that seemed to call her upward.",
        'Mystery Writer',
        '📚',
      ),
      createExampleContent(
        '3',
        'example-2',
        'Your time to write!',
        'You',
        '✍️',
      ),
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    authorId: 'Sarah Morgan',
    maxLength: 1000,
    autoAccept: false,
    like: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'example-3',
    title: 'The Last Adventure',
    description:
      'An epic fantasy tale where heroes face their greatest challenges.',
    threadContents: [
      createExampleContent(
        '1',
        'example-3',
        "The ancient map trembled in Elara's hands as she stood before the massive stone doors. Carved with symbols that hadn't been seen in a thousand years, they marked the entrance to the Lost Temple of Azarath. Her companions gathered behind her, their weapons ready, their faces set with determination.",
        'Elara the Brave',
        '⚔️',
      ),
      createExampleContent(
        '2',
        'example-3',
        'As the doors creaked open, a gust of stale air rushed out, carrying whispers of forgotten spells. The torchlight revealed a chamber of impossible size, its walls covered in glowing crystals that pulsed with an otherworldly light. In the center stood a pedestal, and upon it, the legendary Sword of Dawn.',
        'Wizard of the West',
        '🧙',
      ),
      createExampleContent(
        '3',
        'example-3',
        "But before Elara could take a step forward, the ground beneath them began to tremble. The crystals' light intensified, and from the shadows emerged the temple's ancient guardian - a massive stone golem, its eyes burning with the same blue light as the crystals. The real challenge was about to begin.",
        'Dragon Slayer',
        '🐉',
      ),
      createExampleContent(
        '4',
        'example-3',
        'Your time to write!',
        'You',
        '✍️',
      ),
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    authorId: 'Elara the Brave',
    maxLength: 1000,
    autoAccept: false,
    like: 0,
    updatedAt: new Date().toISOString(),
  },
];

interface ThreadCardProps {
  thread: Thread;
  isExample?: boolean;
  onLike?: () => void;
}

const ThreadCard = ({ thread, isExample = false, onLike }: ThreadCardProps) => {
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isExample) {
      toast({
        title: 'Example Thread',
        description:
          'This is an example thread. Create your own to start liking!',
        status: 'info',
        duration: 3000,
      });
    } else {
      onLike?.();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isExample) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <ChakraLink
      as={Link as any}
      to={isExample ? '#' : `/threads/${thread.id}`}
      key={thread.id}
      _hover={{ textDecoration: 'none' }}
      onClick={handleClick}
    >
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="xl"
        bg={isExample ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)'}
        backdropFilter="blur(10px)"
        _hover={{
          shadow: '2xl',
          transform: 'translateY(-4px) scale(1.01)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderColor: 'purple.300',
        }}
        borderColor="purple.100"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background:
            'linear-gradient(90deg, purple.400, pink.400, orange.400)',
          opacity: 0,
          transition: 'opacity 0.3s',
        }}
        _hover={{
          _before: {
            opacity: 1,
          },
        }}
      >
        <Stack spacing={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <HStack spacing={4} align="center">
              <Heading
                size="md"
                bgGradient="linear(to-r, purple.600, pink.600)"
                bgClip="text"
                fontWeight="bold"
              >
                {thread.title}
              </Heading>
              <HStack spacing={-4} align="center">
                {thread.threadContents.slice(0, 3).map((content, index) => (
                  <Box
                    key={content.id}
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="purple.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="purple.700"
                    fontWeight="bold"
                    fontSize="sm"
                    border="2px solid white"
                    boxShadow="sm"
                    transform={`translateX(${index * -8}px)`}
                    _hover={{
                      transform: `translateX(${index * -8}px) translateY(-2px)`,
                      transition: 'transform 0.2s',
                      zIndex: 1,
                    }}
                    position="relative"
                    zIndex={3 - index}
                  >
                    {content.authorEmoji}
                  </Box>
                ))}
                {thread.threadContents.length > 3 && (
                  <Box
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="purple.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="purple.600"
                    fontWeight="bold"
                    fontSize="xs"
                    border="2px solid white"
                    boxShadow="sm"
                    transform={`translateX(${3 * -8}px)`}
                    _hover={{
                      transform: `translateX(${3 * -8}px) translateY(-2px)`,
                      transition: 'transform 0.2s',
                      zIndex: 1,
                    }}
                    position="relative"
                    zIndex={0}
                  >
                    +{thread.threadContents.length - 3}
                  </Box>
                )}
              </HStack>
            </HStack>
            <IconButton
              aria-label="Like thread"
              icon={<Icon as={FaHeart} color="red.400" />}
              size="sm"
              colorScheme={isExample ? 'purple' : 'red'}
              variant="ghost"
              onClick={handleLike}
              _hover={{
                bg: 'rgba(255, 182, 193, 0.2)',
                transform: 'scale(1.1)',
                transition: 'all 0.2s',
              }}
            />
          </Box>
          <Text
            color="gray.600"
            fontSize="md"
            lineHeight="tall"
            fontFamily="body"
          >
            {thread.description}
          </Text>
          {isExample && (
            <Box
              maxH={isExpanded ? '2000px' : '0'}
              opacity={isExpanded ? 1 : 0}
              transform={isExpanded ? 'translateY(0)' : 'translateY(-20px)'}
              transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
              overflow="hidden"
              visibility={isExpanded ? 'visible' : 'hidden'}
            >
              <VStack spacing={0} align="stretch" mt={4}>
                {thread.threadContents.map((content, index) => (
                  <Box
                    key={content.id}
                    p={4}
                    bg="purple.50"
                    _first={{ borderTopRadius: 'md' }}
                    _last={{ borderBottomRadius: 'md' }}
                  >
                    <HStack spacing={4} align="start">
                      <VStack
                        spacing={1}
                        align="center"
                        w="100px"
                        flexShrink={0}
                        borderRight="1px solid"
                        borderColor="purple.100"
                        pr={4}
                      >
                        <Box
                          w="40px"
                          h="40px"
                          borderRadius="full"
                          bg="purple.200"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="purple.700"
                          fontWeight="bold"
                          fontSize="xl"
                        >
                          {content.authorEmoji}
                        </Box>
                        <Text
                          fontSize="sm"
                          color="purple.700"
                          fontWeight="bold"
                          textAlign="center"
                        >
                          {content.authorId}
                        </Text>
                      </VStack>
                      <Box flex={1} minW={0}>
                        <Text color="gray.700" whiteSpace="pre-wrap">
                          {content.content}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
          {isExample && (
            <Box textAlign="center" mt={-2} mb={-6} py={0}>
              <Icon
                as={FaChevronDown}
                color="purple.400"
                transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                transition="transform 0.3s ease"
                w={5}
                h={5}
                opacity={0.7}
                _hover={{ opacity: 1 }}
              />
            </Box>
          )}
        </Stack>
      </Box>
    </ChakraLink>
  );
};

export function ThreadList() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const signIn = useSignIn();
  const { data: threads = [], isLoading, error } = useThreads();
  const likeThread = useLikeThread();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn.mutateAsync({ email, password });
  };

  const handleLike = async (threadId: string) => {
    await likeThread.mutateAsync(threadId);
  };

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Stack spacing={8}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading>Cows</Heading>
              <Text color="gray.600" fontSize="md" mt={1}>
                The{' '}
                <Text as="span" fontWeight="bold">
                  CO
                </Text>
                laborative{' '}
                <Text as="span" fontWeight="bold">
                  W
                </Text>
                riting{' '}
                <Text as="span" fontWeight="bold">
                  S
                </Text>
                pace
              </Text>
            </Box>
            <Button colorScheme="blue" isDisabled>
              Create New Thread
            </Button>
          </Box>
          <VStack spacing={4} align="stretch">
            {[1, 2, 3].map((i) => (
              <Box key={i} p={6} borderWidth="1px" borderRadius="lg">
                <Stack spacing={3}>
                  <Skeleton height="24px" width="60%" />
                  <Skeleton height="20px" width="80%" />
                  <Skeleton height="16px" width="40%" />
                </Stack>
              </Box>
            ))}
          </VStack>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box
        textAlign="center"
        mb={12}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '4px',
          background:
            'linear-gradient(90deg, purple.400, pink.400, orange.400)',
          borderRadius: '2px',
        }}
      >
        <HStack spacing={4} justify="center" mb={4}>
          <Heading
            as="h1"
            size="4xl"
            bgGradient="linear(to-r, purple.600, pink.600)"
            bgClip="text"
            fontWeight="extrabold"
          >
            Cows
          </Heading>
        </HStack>
        <Text
          fontSize="xl"
          color="gray.600"
          maxW="2xl"
          mx="auto"
          fontFamily="body"
          lineHeight="tall"
        >
          The Collaborative Writing Space. Or, just Co-Writers.
        </Text>
      </Box>

      <Stack spacing={8}>
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
              Explore the Dreams
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Discover stories from other dreamers
            </Text>
            {/* Content will be added here */}
          </VStack>
        </Box>

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
              Join a Story
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Be a collaborator and write a part of story
            </Text>
            <Box
              display="grid"
              gridTemplateColumns="repeat(auto-fit, minmax(450px, 1fr))"
              gap={6}
              justifyItems="center"
            >
              {ExampleThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} isExample={true} />
              ))}
            </Box>
          </VStack>
        </Box>

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
              Make your story
            </Heading>

            <HStack spacing={8} align="stretch">
              {/* First Box - Be an Editor */}
              <VStack spacing={4} align="stretch" w="50%">
                <Text color="purple.500" fontSize="2xl" fontWeight="medium">
                  Be an Editor
                </Text>
                <Box
                  p={6}
                  borderWidth="1px"
                  borderRadius="xl"
                  bg="rgba(255, 255, 255, 0.7)"
                  backdropFilter="blur(10px)"
                  borderColor="purple.100"
                  position="relative"
                  overflow="hidden"
                >
                  <VStack spacing={8} align="stretch">
                    {/* Story Flow Diagram */}
                    <Box position="relative">
                      <HStack spacing={16} align="center" justify="flex-start">
                        {/* Starting Point */}
                        <Box
                          p={4}
                          borderRadius="lg"
                          bg="purple.50"
                          borderWidth="1px"
                          borderColor="purple.200"
                          flex="0 0 250px"
                          position="relative"
                        >
                          <Text color="purple.600" fontWeight="bold" mb={2}>
                            The Old Mansion
                          </Text>
                          <Text color="gray.600" fontSize="sm">
                            A mysterious mansion stands empty for decades, until
                            one night, a single light appears in the attic
                            window. Detective Sarah Morgan approaches the
                            creaking front door, her flashlight cutting through
                            the misty night.
                          </Text>
                        </Box>

                        {/* Branches */}
                        <VStack spacing={6} flex="0 0 200px" align="stretch">
                          {/* First Branch */}
                          <Box
                            p={4}
                            borderRadius="lg"
                            bg="purple.50"
                            borderWidth="1px"
                            borderColor="purple.200"
                            w="100%"
                            transition="all 0.2s"
                            _hover={
                              selectedBranch === null
                                ? {
                                    transform: 'translateY(-2px)',
                                    shadow: 'md',
                                    borderColor: 'purple.300',
                                    bg: 'purple.100',
                                  }
                                : {}
                            }
                            onClick={() => setSelectedBranch(1)}
                            cursor="pointer"
                            display={
                              selectedBranch === null || selectedBranch === 1
                                ? 'block'
                                : 'none'
                            }
                            transform={
                              selectedBranch === 1 ? 'translateY(0)' : 'none'
                            }
                            position="relative"
                            zIndex={selectedBranch === 1 ? 1 : 0}
                          >
                            <Text color="purple.600" fontWeight="bold" mb={2}>
                              {selectedBranch === 1
                                ? 'Story continues...'
                                : 'Candidate #1'}
                            </Text>
                            <Text color="gray.600" fontSize="sm">
                              Inside, Sarah discovers a hidden room filled with
                              old photographs. Each photo shows the same family,
                              but in each one, a different person is missing.
                              The last photo shows only an empty chair...
                            </Text>
                          </Box>

                          {/* Second Branch */}
                          <Box
                            p={4}
                            borderRadius="lg"
                            bg="purple.50"
                            borderWidth="1px"
                            borderColor="purple.200"
                            w="100%"
                            transition="all 0.2s"
                            _hover={
                              selectedBranch === null
                                ? {
                                    transform: 'translateY(-2px)',
                                    shadow: 'md',
                                    borderColor: 'purple.300',
                                    bg: 'purple.100',
                                  }
                                : {}
                            }
                            onClick={() => setSelectedBranch(2)}
                            cursor="pointer"
                            display={
                              selectedBranch === null || selectedBranch === 2
                                ? 'block'
                                : 'none'
                            }
                            transform={
                              selectedBranch === 2 ? 'translateY(0)' : 'none'
                            }
                            position="relative"
                            zIndex={selectedBranch === 2 ? 1 : 0}
                          >
                            <Text color="purple.600" fontWeight="bold" mb={2}>
                              {selectedBranch === 2
                                ? 'Story continues...'
                                : 'Candidate #2'}
                            </Text>
                            <Text color="gray.600" fontSize="sm">
                              As Sarah explores the mansion, she finds a series
                              of coded messages hidden in the wallpaper. Each
                              message seems to lead to a different room, but the
                              last one points to a wall with no door...
                            </Text>
                          </Box>
                        </VStack>
                      </HStack>

                      {/* Single Horizontal Line */}
                      <Box
                        position="absolute"
                        top="50%"
                        left="250px"
                        width="70px"
                        height="2px"
                        bg="purple.200"
                        transform="translateY(-50%)"
                      />
                    </Box>
                  </VStack>
                </Box>
              </VStack>

              {/* Second Box - Accept First Contribution */}
              <VStack spacing={4} align="stretch" w="50%">
                <Text color="purple.500" fontSize="2xl" fontWeight="medium">
                  Or, Open to contributors
                </Text>
                <Box
                  p={6}
                  borderWidth="1px"
                  borderRadius="xl"
                  bg="rgba(255, 255, 255, 0.7)"
                  backdropFilter="blur(10px)"
                  borderColor="purple.100"
                  position="relative"
                  overflow="hidden"
                >
                  <HStack spacing={4} align="stretch">
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg="purple.50"
                      borderWidth="1px"
                      borderColor="purple.200"
                      flex="1"
                    >
                      <Text color="purple.600" fontWeight="bold" mb={2}>
                        The Old Mansion
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        A light flickers in the attic window of the abandoned
                        mansion. Detective Sarah Morgan approaches, her
                        flashlight cutting through the misty night.
                      </Text>
                    </Box>

                    <Box
                      p={4}
                      borderRadius="lg"
                      bg="purple.50"
                      borderWidth="1px"
                      borderColor="purple.200"
                      flex="1"
                    >
                      <Text color="purple.600" fontWeight="bold" mb={2}>
                        Contribution #1
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        Inside, Sarah finds an open book on a dusty desk. Its
                        pages glow with strange symbols that seem to pulse with
                        an otherworldly light.
                      </Text>
                    </Box>

                    <Box
                      p={4}
                      borderRadius="lg"
                      bg="purple.50"
                      borderWidth="1px"
                      borderColor="purple.200"
                      flex="1"
                    >
                      <Text color="purple.600" fontWeight="bold" mb={2}>
                        Contribution #2
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        The symbols match patterns in the wallpaper, leading
                        Sarah deeper into the mansion. Each step reveals more of
                        its dark secrets.
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {!signIn.isSuccess ? (
          <Box
            p={8}
            borderRadius="xl"
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(10px)"
            borderWidth="1px"
            borderColor="purple.100"
            shadow="xl"
            textAlign="center"
          >
            <VStack spacing={6}>
              <Heading
                size="lg"
                bgGradient="linear(to-r, purple.600, pink.600)"
                bgClip="text"
                fontWeight="bold"
              >
                Start Your Journey
              </Heading>
              <Text color="gray.600" fontSize="lg" maxW="2xl">
                Sign in to create your own threads and contribute to the
                collaborative storytelling experience.
              </Text>
              <HStack spacing={4} justify="center">
                <Link to="/signin" style={{ textDecoration: 'none' }}>
                  <Button
                    colorScheme="purple"
                    size="lg"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <Button
                    colorScheme="pink"
                    size="lg"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Sign Up
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </Box>
        ) : (
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
              <Link to="/threads/new" style={{ textDecoration: 'none' }}>
                <Button
                  colorScheme="purple"
                  size="lg"
                  leftIcon={<Icon as={FaPlus} />}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                  }}
                  transition="all 0.2s"
                >
                  Create New Thread
                </Button>
              </Link>
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
                    You haven't created any threads yet. Start your first story
                    now!
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
                      onLike={() => handleLike(thread.id)}
                    />
                  ))}
                </Box>
              )}
            </VStack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
