import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Textarea,
  Input,
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
  IconButton,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBook,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
} from 'react-icons/fa';
import {
  useThread,
  useAddContent,
  useReorderContent,
  useLikeContent,
} from '../api/hooks';
import { CandidateSubmissions } from './CandidateSubmissions';
import { UpdateThreadModal } from './UpdateThreadModal';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [isReadMode, setIsReadMode] = useState(false);
  const {
    isOpen: isUpdateModalOpen,
    onOpen: onUpdateModalOpen,
    onClose: onUpdateModalClose,
  } = useDisclosure();
  const ITEMS_PER_PAGE = 5; // Number of story contributions per page

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

    if (newContent.length > thread.maxLength) {
      toast({
        title: 'Content too long',
        description: `Content must be ${thread.maxLength} characters or less`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await addContent.mutateAsync({ content: newContent });
      setNewContent('');

      if (thread.autoAccept || (user && user.userId === thread.author.id)) {
        // Go to last page to show new content
        const newTotalContents = acceptedContents.length + 1;
        const newTotalPages = Math.ceil(newTotalContents / ITEMS_PER_PAGE);
        setCurrentPage(newTotalPages);

        toast({
          title: 'Content added',
          description: 'Your contribution has been added to the story',
          status: 'success',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Contribution submitted',
          description:
            'Your contribution is pending review by the thread creator',
          status: 'info',
          duration: 4000,
        });
      }
    } catch (error: any) {
      toast({
        title:
          thread.autoAccept || (user && user.userId === thread.author.id)
            ? 'Failed to add content'
            : 'Failed to submit contribution',
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

  // Pagination logic for story content
  const acceptedContents =
    thread?.threadContents
      .filter((content) => content.status === 'ACCEPTED')
      .sort((a, b) => a.order - b.order) || [];

  const totalPages = Math.ceil(acceptedContents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageContents = acceptedContents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    setPageInput(validPage.toString());
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = () => {
    const pageNumber = parseInt(pageInput);
    if (!isNaN(pageNumber)) {
      handlePageChange(pageNumber);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  return (
    <Container sx={containerStyles}>
      <HStack spacing={3} mb={4} align="center">
        <Button
          leftIcon={<Icon as={FaArrowLeft} />}
          variant="solid"
          colorScheme="blue"
          size="md"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        {user && user.userId === thread.author.id && (
          <Button
            leftIcon={<Icon as={FaCog} />}
            variant="solid"
            colorScheme="orange"
            size="md"
            onClick={onUpdateModalOpen}
            bg="orange.500"
            color="white"
            _hover={{
              bg: 'orange.600',
            }}
            _active={{
              bg: 'orange.700',
            }}
            shadow="md"
          >
            Settings
          </Button>
        )}
      </HStack>

      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" sx={titleStyles}>
            {thread.title}
          </Heading>
          <Text sx={descriptionStyles}>{thread.description}</Text>
        </Box>

        <Box sx={contentBoxStyles}>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="center">
              <Heading size="md">Story</Heading>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant={isReadMode ? 'solid' : 'outline'}
                  colorScheme={isReadMode ? 'orange' : 'blue'}
                  leftIcon={<Icon as={isReadMode ? FaEdit : FaBook} />}
                  onClick={() => setIsReadMode(!isReadMode)}
                >
                  {isReadMode ? 'Edit Mode' : 'Read Mode'}
                </Button>
              </HStack>
            </HStack>
            <Box sx={threadContentStyles}>
              {currentPageContents.map((content, index) => (
                <Popover key={content.id} trigger="hover" placement="top">
                  <PopoverTrigger>
                    <Text sx={contentTextStyles} cursor="pointer" mb={4}>
                      {content.content}
                    </Text>
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
              ))}
            </Box>

            {/* Pagination controls */}
            <Flex justify="center" align="center" mt={6}>
              <HStack spacing={2} align="center">
                <IconButton
                  aria-label="Previous page"
                  icon={<Icon as={FaChevronLeft} />}
                  size="sm"
                  variant="outline"
                  colorScheme="orange"
                  onClick={handlePreviousPage}
                  isDisabled={currentPage === 1}
                />
                <HStack spacing={1} align="center">
                  <Input
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputSubmit}
                    onKeyPress={handlePageInputKeyPress}
                    size="sm"
                    width="60px"
                    textAlign="center"
                    variant="outline"
                    borderColor="orange.300"
                    _focus={{
                      borderColor: 'orange.500',
                      boxShadow: '0 0 0 1px orange.500',
                    }}
                  />
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    /
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="medium"
                    minW="30px"
                  >
                    {totalPages}
                  </Text>
                </HStack>
                <IconButton
                  aria-label="Next page"
                  icon={<Icon as={FaChevronRight} />}
                  size="sm"
                  variant="outline"
                  colorScheme="orange"
                  onClick={handleNextPage}
                  isDisabled={currentPage === totalPages}
                />
              </HStack>
            </Flex>
          </VStack>
        </Box>

        {/* Candidate Submissions Section */}
        {user &&
          !isReadMode &&
          thread.threadContents.some(
            (content) => content.status === 'PENDING',
          ) && (
            <Box sx={contentBoxStyles}>
              <CandidateSubmissions
                threadId={thread.id}
                pendingContents={thread.threadContents.filter(
                  (content) => content.status === 'PENDING',
                )}
                currentUserId={user.userId}
                maxLength={thread.maxLength}
                isThreadOwner={user.userId === thread.author.id}
                onManagePending={() =>
                  navigate(`/threads/${thread.id}/pending`)
                }
              />
            </Box>
          )}

        {user && !isReadMode && (
          <Box sx={contentBoxStyles}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">
                {thread.autoAccept || user.userId === thread.author.id
                  ? 'Add Your Story'
                  : 'Submit Your Contribution'}
              </Heading>
              {!thread.autoAccept && user.userId !== thread.author.id && (
                <Text fontSize="sm" color="gray.600">
                  Your contribution will be reviewed by the thread creator
                  before being added to the story.
                </Text>
              )}
              <Box>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={
                    thread.autoAccept || user.userId === thread.author.id
                      ? 'Write your part of the story...'
                      : 'Write your contribution for review...'
                  }
                  maxLength={thread.maxLength}
                  sx={textareaStyles}
                />
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="sm" color="gray.500">
                    This thread allows up to {thread.maxLength} characters per
                    contribution
                  </Text>
                  <Text
                    fontSize="sm"
                    color={
                      Math.max(0, thread.maxLength - newContent.length) < 10
                        ? 'red.500'
                        : 'green.500'
                    }
                    fontWeight="medium"
                  >
                    {Math.max(0, thread.maxLength - newContent.length)}{' '}
                    characters remaining
                  </Text>
                </HStack>
              </Box>
              <Button
                sx={submitButtonStyles}
                onClick={handleAddContent}
                isLoading={addContent.isPending}
                isDisabled={
                  newContent.length > thread.maxLength || !newContent.trim()
                }
                loadingText={
                  thread.autoAccept || user.userId === thread.author.id
                    ? 'Adding...'
                    : 'Submitting...'
                }
                colorScheme={
                  thread.autoAccept || user.userId === thread.author.id
                    ? 'blue'
                    : 'orange'
                }
              >
                {thread.autoAccept || user.userId === thread.author.id
                  ? 'Contribute'
                  : 'Submit for Review'}
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>

      {/* Update Thread Modal */}
      <UpdateThreadModal
        isOpen={isUpdateModalOpen}
        onClose={onUpdateModalClose}
        thread={thread}
      />
    </Container>
  );
}
