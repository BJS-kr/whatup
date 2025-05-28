import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Badge,
  Avatar,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCheck, FaTimes, FaClock, FaEdit } from 'react-icons/fa';
import { usePendingContents } from '../hooks/useThreads';
import { useRequestChanges } from '../api/hooks';
import { formatRelativeTime } from '../utils/format';

export function PendingContents() {
  const { id: threadId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [changeRequestMessage, setChangeRequestMessage] = useState('');

  const {
    pendingContents,
    loading,
    error,
    acceptContent,
    rejectContent,
    refetch,
  } = usePendingContents(threadId!);

  const requestChangesMutation = useRequestChanges();

  const handleAccept = async (contentId: string) => {
    try {
      await acceptContent(contentId);
      toast({
        title: 'Content accepted',
        description: 'The content has been added to the thread',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to accept content',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleReject = async (contentId: string) => {
    try {
      await rejectContent(contentId);
      toast({
        title: 'Content rejected',
        description: 'The content has been removed from pending list',
        status: 'info',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to reject content',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRequestChanges = (contentId: string) => {
    setSelectedContentId(contentId);
    setChangeRequestMessage('');
    onOpen();
  };

  const handleSendChangeRequest = async () => {
    if (!changeRequestMessage.trim()) {
      toast({
        title: 'Message required',
        description: 'Please provide feedback for the contributor',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await requestChangesMutation.mutateAsync({
        contentId: selectedContentId,
        message: changeRequestMessage,
      });

      toast({
        title: 'Change request sent',
        description: 'The contributor has been notified of your feedback',
        status: 'success',
        duration: 3000,
      });
      onClose();
      setChangeRequestMessage('');
      setSelectedContentId('');
    } catch (error) {
      toast({
        title: 'Failed to send change request',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Loading pending contents...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack spacing={4}>
          <Button
            leftIcon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Back to Thread
          </Button>
          <Box flex={1}>
            <Heading size="lg">Pending Contents</Heading>
            <Text color="gray.600" mt={1}>
              Review and manage candidate contributions
            </Text>
          </Box>
          <Button onClick={refetch} variant="outline" size="sm">
            Refresh
          </Button>
        </HStack>

        {/* Content List */}
        {pendingContents.length === 0 ? (
          <Card>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Icon as={FaClock} boxSize={12} color="gray.400" />
                <Text fontSize="lg" color="gray.600">
                  No pending contents
                </Text>
                <Text color="gray.500" textAlign="center">
                  All contributions have been reviewed or no new submissions are
                  waiting for approval.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {pendingContents.map((content, index) => (
              <Card key={content.id} variant="outline">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Content Header */}
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Avatar size="sm" name={content.author.nickname} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">
                            {content.author.nickname}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {formatRelativeTime(content.createdAt)}
                          </Text>
                        </VStack>
                      </HStack>
                      <Badge colorScheme="orange" variant="subtle">
                        <Icon as={FaClock} mr={1} />
                        Pending
                      </Badge>
                    </HStack>

                    {/* Content Text */}
                    <Box
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      borderLeft="4px solid"
                      borderLeftColor="orange.400"
                    >
                      <Text>{content.content}</Text>
                    </Box>

                    {/* Action Buttons */}
                    <HStack spacing={3} justify="flex-end">
                      <Button
                        leftIcon={<Icon as={FaTimes} />}
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(content.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        leftIcon={<Icon as={FaEdit} />}
                        colorScheme="orange"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestChanges(content.id)}
                      >
                        Request Changes
                      </Button>
                      <Button
                        leftIcon={<Icon as={FaCheck} />}
                        colorScheme="green"
                        size="sm"
                        onClick={() => handleAccept(content.id)}
                      >
                        Accept
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Request Changes Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.600">
                Provide feedback to help the contributor improve their
                submission:
              </Text>
              <Textarea
                value={changeRequestMessage}
                onChange={(e) => setChangeRequestMessage(e.target.value)}
                placeholder="Explain what changes you'd like to see..."
                rows={6}
                resize="vertical"
              />
              <Text fontSize="sm" color="gray.500">
                The contributor will receive your feedback and can edit their
                submission accordingly.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleSendChangeRequest}
              isDisabled={!changeRequestMessage.trim()}
            >
              Send Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
