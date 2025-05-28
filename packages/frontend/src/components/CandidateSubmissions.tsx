import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Icon,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { FaEdit, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ThreadContent } from '../api/types';
import { useUpdatePendingContent } from '../api/hooks';
import { formatRelativeTime } from '../utils/format';

interface CandidateSubmissionsProps {
  threadId: string;
  pendingContents: ThreadContent[];
  currentUserId?: string;
  maxLength: number;
  isThreadOwner?: boolean;
  onManagePending?: () => void;
}

export function CandidateSubmissions({
  threadId,
  pendingContents,
  currentUserId,
  maxLength,
  isThreadOwner,
  onManagePending,
}: CandidateSubmissionsProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingContent, setEditingContent] = useState<ThreadContent | null>(
    null,
  );
  const [editText, setEditText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const updatePendingContent = useUpdatePendingContent();

  const ITEMS_PER_PAGE = 3;

  // Sort pending contents: user's submissions first, then others
  const sortedPendingContents = [...pendingContents].sort((a, b) => {
    if (a.author.id === currentUserId && b.author.id !== currentUserId)
      return -1;
    if (a.author.id !== currentUserId && b.author.id === currentUserId)
      return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedPendingContents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageContents = sortedPendingContents.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleEditClick = (content: ThreadContent) => {
    setEditingContent(content);
    setEditText(content.content);
    onOpen();
  };

  const handleUpdateSubmit = async () => {
    if (!editingContent || !editText.trim()) {
      toast({
        title: 'Content is required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (editText.length > maxLength) {
      toast({
        title: 'Content too long',
        description: `Content must be ${maxLength} characters or less`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await updatePendingContent.mutateAsync({
        contentId: editingContent.id,
        content: editText,
      });

      toast({
        title: 'Submission updated',
        description: 'Your contribution has been updated successfully',
        status: 'success',
        duration: 3000,
      });

      onClose();
      setEditingContent(null);
      setEditText('');
    } catch (error: any) {
      toast({
        title: 'Failed to update submission',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleModalClose = () => {
    onClose();
    setEditingContent(null);
    setEditText('');
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (sortedPendingContents.length === 0) {
    return null;
  }

  return (
    <>
      <Box>
        <HStack justify="space-between" align="center" mb={3}>
          <Text fontSize="md" fontWeight="semibold" color="gray.700">
            Pending Submissions ({sortedPendingContents.length})
          </Text>
          <HStack spacing={3}>
            {isThreadOwner && onManagePending && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="orange"
                onClick={onManagePending}
              >
                Manage Pending
              </Button>
            )}
            {totalPages > 1 && (
              <HStack spacing={2}>
                <IconButton
                  aria-label="Previous page"
                  icon={<Icon as={FaChevronLeft} />}
                  size="sm"
                  variant="outline"
                  onClick={handlePreviousPage}
                  isDisabled={currentPage === 1}
                />
                <Text
                  fontSize="sm"
                  color="gray.600"
                  minW="60px"
                  textAlign="center"
                >
                  {currentPage} / {totalPages}
                </Text>
                <IconButton
                  aria-label="Next page"
                  icon={<Icon as={FaChevronRight} />}
                  size="sm"
                  variant="outline"
                  onClick={handleNextPage}
                  isDisabled={currentPage === totalPages}
                />
              </HStack>
            )}
          </HStack>
        </HStack>
        {sortedPendingContents.length > 0 && (
          <Text fontSize="sm" color="gray.600" mb={3}>
            All candidate submissions from participants are shown below. Your
            submissions appear first.
          </Text>
        )}
        <VStack spacing={3} align="stretch">
          {currentPageContents.map((content) => (
            <Card key={content.id} variant="outline" size="sm">
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between" align="start">
                    <HStack spacing={3} flex={1}>
                      <Avatar size="sm" name={content.author.nickname} />
                      <VStack align="start" spacing={0} flex={1}>
                        <HStack spacing={2} align="center">
                          <Text fontWeight="medium" fontSize="sm">
                            {content.author.nickname}
                          </Text>
                          {content.author.id === currentUserId && (
                            <Badge colorScheme="blue" size="sm">
                              Your submission
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {formatRelativeTime(content.createdAt)}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={2}>
                      <Badge colorScheme="orange" variant="subtle" size="sm">
                        <Icon as={FaClock} mr={1} />
                        Pending
                      </Badge>
                      {content.author.id === currentUserId && (
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="blue"
                          leftIcon={<Icon as={FaEdit} />}
                          onClick={() => handleEditClick(content)}
                        >
                          Edit
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                  <Box
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    borderLeft="3px solid"
                    borderLeftColor="orange.400"
                  >
                    <Text fontSize="sm" color="gray.700">
                      {truncateContent(content.content)}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Your Submission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Edit your contribution..."
                  maxLength={maxLength}
                  rows={6}
                  resize="vertical"
                />
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="sm" color="gray.500">
                    Maximum {maxLength} characters
                  </Text>
                  <Text
                    fontSize="sm"
                    color={
                      Math.max(0, maxLength - editText.length) < 10
                        ? 'red.500'
                        : 'green.500'
                    }
                    fontWeight="medium"
                  >
                    {Math.max(0, maxLength - editText.length)} characters
                    remaining
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateSubmit}
              isLoading={updatePendingContent.isPending}
              isDisabled={editText.length > maxLength || !editText.trim()}
              loadingText="Updating..."
            >
              Update Submission
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
