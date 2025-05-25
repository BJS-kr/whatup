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
  Icon,
  Flex,
  Avatar,
  Grid,
  SkeletonText,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaHeart,
  FaPlus,
  FaChevronDown,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from 'react-icons/fa';
import type { Thread, ThreadContent } from '../api/types';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ThreadCard } from '../components/ThreadCard';
import {
  containerStyles,
  headerStyles,
  titleStyles,
  subtitleStyles,
  sectionStyles,
  sectionTitleStyles,
  sectionTextStyles,
  gridStyles,
  storyBoxStyles,
  storyTitleStyles,
  storyCardStyles,
  storyCardTitleStyles,
  storyCardTextStyles,
  connectorLineStyles,
  ctaBoxStyles,
  ctaTitleStyles,
  ctaTextStyles,
  buttonGroupStyles,
} from './LandingPage.styles';

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
  author: {
    id: authorName,
    email: '',
    nickname: authorName,
    service: 'local',
    like: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});

const ExampleThreads: Thread[] = [
  {
    id: 'example-2',
    title: 'Mystery in the Old Mansion',
    description: 'A thrilling mystery where each writer adds their own twist.',
    threadContents: [
      createExampleContent(
        '1',
        'example-2',
        'A single light flickers in the attic window of the abandoned mansion. Detective Sarah Morgan approaches, her flashlight cutting through the misty night.',
        'Sarah Morgan',
        '🔍',
      ),
      createExampleContent(
        '2',
        'example-2',
        'Inside, Sarah finds an open book on a dusty desk. Its pages glow with strange symbols that pulse with an otherworldly light.',
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
    author: {
      id: 'Sarah Morgan',
      email: '',
      nickname: 'Sarah Morgan',
      service: 'local',
      like: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    maxLength: 1000,
    autoAccept: false,
    allowConsecutiveContribution: false,
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
        "The ancient map trembles in Elara's hands as she stands before the massive stone doors of the Lost Temple. Her companions gather behind her, weapons ready.",
        'Elara the Brave',
        '⚔️',
      ),
      createExampleContent(
        '2',
        'example-3',
        'As the doors creak open, a gust of stale air rushes out. The torchlight reveals a chamber of impossible size, its walls covered in glowing crystals.',
        'Wizard of the West',
        '🧙',
      ),
      createExampleContent(
        '3',
        'example-3',
        'Your time to write!',
        'You',
        '✍️',
      ),
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    authorId: 'Elara the Brave',
    author: {
      id: 'Elara the Brave',
      email: '',
      nickname: 'Elara the Brave',
      service: 'local',
      like: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    maxLength: 1000,
    autoAccept: false,
    allowConsecutiveContribution: false,
    like: 0,
    updatedAt: new Date().toISOString(),
  },
];

export const LandingPage = () => {
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/user');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <Container sx={containerStyles}>
        <Stack spacing={4}>
          <Skeleton height="40px" />
          <Skeleton height="200px" />
          <Skeleton height="100px" />
        </Stack>
      </Container>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Container sx={containerStyles}>
      <Box sx={headerStyles}>
        <HStack spacing={4} justify="center" mb={4}>
          <Heading sx={titleStyles}>Cows</Heading>
        </HStack>
        <Text sx={subtitleStyles}>
          The Collaborative Writing Space. Or, just Co-Writers.
        </Text>
      </Box>

      <Stack spacing={8}>
        <Box sx={sectionStyles}>
          <VStack spacing={6} align="stretch">
            <Heading sx={sectionTitleStyles}>Explore the Dreams</Heading>
            <Text sx={sectionTextStyles}>
              Discover stories from other dreamers
            </Text>
          </VStack>
        </Box>

        <Box sx={sectionStyles}>
          <VStack spacing={6} align="stretch">
            <Heading sx={sectionTitleStyles}>Join a Story</Heading>
            <Text sx={sectionTextStyles}>
              Be a collaborator and write a part of story
            </Text>
            <Box sx={gridStyles}>
              {ExampleThreads.map((thread) => (
                <Box key={thread.id} w="100%" h="fit-content">
                  <ThreadCard thread={thread} isExample={true} />
                </Box>
              ))}
            </Box>
          </VStack>
        </Box>

        <Box sx={sectionStyles}>
          <VStack spacing={6} align="stretch">
            <Heading sx={sectionTitleStyles}>Make your story</Heading>

            <HStack spacing={8} align="stretch">
              <VStack spacing={4} align="stretch" w="50%">
                <Text sx={storyTitleStyles}>Be an Editor</Text>
                <Box sx={storyBoxStyles}>
                  <VStack spacing={8} align="stretch">
                    <Box position="relative">
                      <HStack spacing={16} align="center" justify="flex-start">
                        <Box sx={storyCardStyles} flex="0 0 250px">
                          <Text sx={storyCardTitleStyles}>The Old Mansion</Text>
                          <Text sx={storyCardTextStyles}>
                            A light flickers in the attic window of the
                            abandoned mansion. Detective Sarah Morgan
                            approaches, her flashlight cutting through the misty
                            night.
                          </Text>
                        </Box>

                        <VStack spacing={6} flex="0 0 200px" align="stretch">
                          <Box
                            sx={storyCardStyles}
                            w="100%"
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
                            <Text sx={storyCardTitleStyles}>
                              {selectedBranch === 1
                                ? 'Story continues...'
                                : 'Contribution #1'}
                            </Text>
                            <Text sx={storyCardTextStyles}>
                              Inside, Sarah finds an open book on a dusty desk.
                              Its pages glow with strange symbols that pulse
                              with an otherworldly light.
                            </Text>
                          </Box>

                          <Box
                            sx={storyCardStyles}
                            w="100%"
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
                            <Text sx={storyCardTitleStyles}>
                              {selectedBranch === 2
                                ? 'Story continues...'
                                : 'Contribution #2'}
                            </Text>
                            <Text sx={storyCardTextStyles}>
                              The symbols match patterns in the wallpaper,
                              leading Sarah deeper into the mansion. Each step
                              reveals more of its dark secrets.
                            </Text>
                          </Box>
                        </VStack>
                      </HStack>

                      <Box sx={connectorLineStyles} />
                    </Box>
                  </VStack>
                </Box>
              </VStack>

              <VStack spacing={4} align="stretch" w="50%">
                <Text sx={storyTitleStyles}>Or, Accept all</Text>
                <Box sx={storyBoxStyles}>
                  <HStack spacing={4} align="stretch">
                    <Box sx={storyCardStyles} flex="1">
                      <Text sx={storyCardTitleStyles}>The Old Mansion</Text>
                      <Text sx={storyCardTextStyles}>
                        A light flickers in the attic window of the abandoned
                        mansion. Detective Sarah Morgan approaches, her
                        flashlight cutting through the misty night.
                      </Text>
                    </Box>

                    <Box sx={storyCardStyles} flex="1">
                      <Text sx={storyCardTitleStyles}>Contribution #1</Text>
                      <Text sx={storyCardTextStyles}>
                        Inside, Sarah finds an open book on a dusty desk. Its
                        pages glow with strange symbols that pulse with an
                        otherworldly light.
                      </Text>
                    </Box>

                    <Box sx={storyCardStyles} flex="1">
                      <Text sx={storyCardTitleStyles}>Contribution #2</Text>
                      <Text sx={storyCardTextStyles}>
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

        <Box sx={ctaBoxStyles}>
          <VStack spacing={6} align="stretch">
            <Heading sx={ctaTitleStyles}>Start Your Journey</Heading>
            <Text sx={ctaTextStyles}>
              Join our community of dreamers and storytellers
            </Text>
            <HStack sx={buttonGroupStyles}>
              <Button
                colorScheme="orange"
                size="lg"
                leftIcon={<Icon as={FaSignInAlt} />}
                onClick={() => navigate('/signin')}
              >
                Sign In
              </Button>
              <Button
                colorScheme="red"
                size="lg"
                leftIcon={<Icon as={FaUserPlus} />}
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Stack>
    </Container>
  );
};
