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
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { FaThumbsUp, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
  useThread,
  useAddContent,
  useAcceptContent,
  useRejectContent,
  useReorderContent,
  useLikeContent,
} from '../api/hooks';

export function ThreadDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data: thread, isLoading, error } = useThread(id!);
  const addContent = useAddContent(id!);
  const acceptContent = useAcceptContent();
  const rejectContent = useRejectContent();
  const reorderContent = useReorderContent();
  const likeContent = useLikeContent();

  const [newContent, setNewContent] = useState('');

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text>Loading thread...</Text>
      </Container>
    );
  }

  if (error || !thread) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text color="red.500">Error loading thread</Text>
      </Container>
    );
  }

  const handleAddContent = async () => {
    if (!newContent.trim()) return;

    try {
      await addContent.mutateAsync({ content: newContent });
      setNewContent('');
      toast({
        title: 'Content added',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error adding content';
      toast({
        title: 'Cannot add content',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLike = async (contentId: string) => {
    try {
      await likeContent.mutateAsync(contentId);
    } catch (error) {
      toast({
        title: 'Error liking content',
        status: 'error',
        duration: 3000,
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
    <Container maxW="container.lg" py={8}>
      <Stack spacing={8}>
        <Box>
          <Heading>{thread.title}</Heading>
          <Text color="gray.600" mt={2}>
            {thread.description}
          </Text>
        </Box>

        <VStack spacing={6} align="stretch">
          {thread.threadContents
            .filter((content) => content.status === 'ACCEPTED')
            .sort((a, b) => a.order - b.order)
            .map((content) => (
              <Box
                key={content.id}
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                position="relative"
              >
                <Stack spacing={4}>
                  <Text>{content.content}</Text>
                  <HStack spacing={4}>
                    <IconButton
                      aria-label="Like"
                      icon={<Icon as={FaThumbsUp} />}
                      onClick={() => handleLike(content.id)}
                      size="sm"
                    >
                      {content.like}
                    </IconButton>
                    <IconButton
                      aria-label="Move up"
                      icon={<Icon as={FaArrowUp} />}
                      onClick={() => handleReorder(content.id, 'up')}
                      size="sm"
                      isDisabled={content.order === 1}
                    />
                    <IconButton
                      aria-label="Move down"
                      icon={<Icon as={FaArrowDown} />}
                      onClick={() => handleReorder(content.id, 'down')}
                      size="sm"
                      isDisabled={
                        content.order === thread.threadContents.length
                      }
                    />
                  </HStack>
                </Stack>
              </Box>
            ))}
        </VStack>

        <Box>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Add your content..."
            minH="100px"
          />
          <Button
            mt={4}
            colorScheme="blue"
            onClick={handleAddContent}
            isLoading={addContent.isPending}
            loadingText="Adding..."
          >
            Add Content
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
