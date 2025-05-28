import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  useNotices,
  useMarkNoticeAsRead,
  useMarkAllNoticesAsRead,
} from '../hooks/useNotices';
import { Notice } from '../api/notices';

const NoticeCard = ({
  notice,
  onMarkAsRead,
}: {
  notice: Notice;
  onMarkAsRead: (id: string) => void;
}) => {
  const navigate = useNavigate();

  const getNoticeColor = (type: Notice['type']) => {
    switch (type) {
      case 'CONTENT_ACCEPTED':
        return 'green';
      case 'CONTENT_REJECTED':
        return 'red';
      case 'CHANGE_REQUEST':
        return 'orange';
      case 'NEW_CONTRIBUTION':
        return 'blue';
      case 'NEW_SUBMISSION':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const handleCardClick = () => {
    if (!notice.isRead) {
      onMarkAsRead(notice.id);
    }
    if (notice.threadId) {
      navigate(`/threads/${notice.threadId}`);
    }
  };

  return (
    <Card
      cursor={notice.threadId ? 'pointer' : 'default'}
      onClick={handleCardClick}
      bg={notice.isRead ? 'gray.50' : 'white'}
      borderLeft={notice.isRead ? 'none' : '4px solid'}
      borderLeftColor={getNoticeColor(notice.type) + '.500'}
      _hover={notice.threadId ? { shadow: 'md' } : {}}
    >
      <CardBody>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2} flex={1}>
            <HStack>
              <Icon as={FaBell} color={getNoticeColor(notice.type) + '.500'} />
              <Text fontWeight="bold" fontSize="sm">
                {notice.title}
              </Text>
              <Badge colorScheme={getNoticeColor(notice.type)} size="sm">
                {notice.type.replace('_', ' ')}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {notice.message}
            </Text>
            <Text fontSize="xs" color="gray.400">
              {new Date(notice.createdAt).toLocaleString()}
            </Text>
          </VStack>
          {!notice.isRead && (
            <Button
              size="xs"
              colorScheme="blue"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notice.id);
              }}
            >
              <Icon as={FaCheck} />
            </Button>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
};

export const Notices = () => {
  const toast = useToast();
  const { data: notices, isLoading, error } = useNotices();
  const { mutate: markAsRead } = useMarkNoticeAsRead();
  const { mutate: markAllAsRead } = useMarkAllNoticesAsRead();

  const handleMarkAsRead = (noticeId: string) => {
    markAsRead(noticeId, {
      onSuccess: () => {
        toast({
          title: 'Notice marked as read',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        toast({
          title: 'All notices marked as read',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      },
    });
  };

  const unreadCount = notices?.filter((notice) => !notice.isRead).length || 0;

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="lg" color="orange.500" />
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Failed to load notifications. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <HStack>
            <Heading size="lg">Notifications</Heading>
            {unreadCount > 0 && (
              <Badge colorScheme="red" borderRadius="full">
                {unreadCount} unread
              </Badge>
            )}
          </HStack>
          {unreadCount > 0 && (
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              leftIcon={<FaCheckDouble />}
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </Flex>

        {!notices || notices.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Icon as={FaBell} size="48px" color="gray.300" mb={4} />
            <Text color="gray.500" fontSize="lg">
              No notifications yet
            </Text>
            <Text color="gray.400" fontSize="sm">
              You'll see notifications here when there are updates on your
              contributions.
            </Text>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};
