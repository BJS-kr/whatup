import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
  HStack,
  Icon,
  Avatar,
  Skeleton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import {
  useThread,
  useAddContent,
  useReorderContent,
  useLikeContent,
} from '../api/hooks';
import { useAuth } from '../contexts/AuthContext';
import {
  containerStyles,
  backButtonStyles,
  titleStyles,
  descriptionStyles,
  contentBoxStyles,
  threadContentStyles,
  contentTextStyles,
  popoverContentStyles,
  avatarStyles,
  authorNameStyles,
  textareaStyles,
  submitButtonStyles,
} from './ThreadDetail.styles';

export function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const {
    data: thread,
    isLoading: isThreadLoading,
    error: threadError,
  } = useThread(id!);
  const addContent = useAddContent(id!);
  const reorderContent = useReorderContent();
  const likeContent = useLikeContent();

  const [newContent, setNewContent] = useState('');

  if (isThreadLoading) {
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

  if (threadError || !thread) {
    return (
      <Container sx={containerStyles}>
        <Text color="red.500">Error loading thread</Text>
      </Container>
    );
  }

  const handleAddContent = async () => {
    if (!newContent.trim()) {
      toast({
        title: 'Content is required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await addContent.mutateAsync({ content: newContent });
      setNewContent('');
      toast({
        title: 'Content added',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to add content',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleLikeContent = async (contentId: string) => {
    try {
      await likeContent.mutateAsync(contentId);
    } catch (error: any) {
      toast({
        title: 'Failed to like content',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleReorder = async (contentId: string, direction: 'up' | 'down') => {
    const content = thread.threadContents.find((c) => c.id === contentId);
    if (!content) return;

    const newOrder = direction === 'up' ? content.order - 1 : content.order + 1;
    try {
      await reorderContent.mutateAsync({ contentId, order: newOrder });
    } catch (error) {
      toast({
        title: 'Error reordering content',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container sx={containerStyles}>
      <Button
        leftIcon={<Icon as={FaArrowLeft} />}
        sx={backButtonStyles}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" sx={titleStyles}>
            {thread.title}
          </Heading>
          <Text sx={descriptionStyles}>{thread.description}</Text>
        </Box>

        <Box sx={contentBoxStyles}>
          <VStack spacing={6} align="stretch">
            <Heading size="md">Story</Heading>
            <Box sx={threadContentStyles}>
              {thread.threadContents
                .sort((a, b) => a.order - b.order)
                .map((content, index) => (
                  <Box
                    key={content.id}
                    position="relative"
                    _hover={{
                      '& .author-info': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    <Popover trigger="hover" placement="top">
                      <PopoverTrigger>
                        <Text sx={contentTextStyles}>{content.content}</Text>
                      </PopoverTrigger>
                      <PopoverContent sx={popoverContentStyles}>
                        <PopoverArrow />
                        <PopoverBody>
                          <HStack spacing={3}>
                            <Avatar
                              sx={avatarStyles}
                              name={content.author.nickname}
                            />
                            <Text sx={authorNameStyles}>
                              {content.author.nickname}
                            </Text>
                          </HStack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Box>
                ))}
            </Box>
          </VStack>
        </Box>

        {user && (
          <Box sx={contentBoxStyles}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Add Your Contribution</Heading>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your part of the story..."
                sx={textareaStyles}
              />
              <Button
                sx={submitButtonStyles}
                onClick={handleAddContent}
                isLoading={addContent.isPending}
                loadingText="Adding..."
              >
                Add Content
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
