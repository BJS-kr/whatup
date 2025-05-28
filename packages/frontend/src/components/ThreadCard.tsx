import {
  Box,
  Heading,
  Text,
  HStack,
  IconButton,
  useToast,
  VStack,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaChevronDown, FaRegHeart, FaCog } from 'react-icons/fa';
import type { Thread } from '../api/types';
import { useState } from 'react';
import { useLikeThread } from '../api/hooks';
import { UpdateThreadModal } from './UpdateThreadModal';
import { useAuth } from '../contexts/AuthContext';
import {
  cardStyles,
  exampleCardStyles,
  titleStyles,
  descriptionStyles,
  contentBoxStyles,
  authorColumnStyles,
  emojiStyles,
  authorNameStyles,
  contentTextStyles,
  iconButtonStyles,
} from './ThreadCard.styles';

export interface ThreadCardProps {
  thread: Thread;
  isExample?: boolean;
  onLike?: (threadId: string) => void;
  showSettings?: boolean;
}

export const ThreadCard = ({
  thread,
  isExample = false,
  onLike,
  showSettings = false,
}: ThreadCardProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isOpen: isUpdateModalOpen,
    onOpen: onUpdateModalOpen,
    onClose: onUpdateModalClose,
  } = useDisclosure();

  const likeThread = useLikeThread();

  const isLiked = isExample
    ? true
    : thread.threadLikes && thread.threadLikes.length > 0;
  const likeCount = thread._count?.threadLikes || 0;

  const handleLike = async () => {
    if (isExample) {
      toast({
        title: 'Example Thread',
        description: 'This is an example thread. Sign in to like real threads!',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like threads',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      await likeThread.mutateAsync(thread.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleClick = () => {
    if (!isExample) {
      navigate(`/threads/${thread.id}`);
    }
  };

  return (
    <Box sx={isExample ? exampleCardStyles : cardStyles} onClick={handleClick}>
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading sx={titleStyles}>{thread.title}</Heading>
          <HStack spacing={2}>
            {isExample && (
              <IconButton
                aria-label="Toggle thread content"
                icon={<Icon as={FaChevronDown} />}
                sx={iconButtonStyles}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                transform={isExpanded ? 'rotate(180deg)' : 'none'}
                transition="transform 0.2s"
              />
            )}
            <HStack spacing={1} align="center">
              <IconButton
                aria-label={isLiked ? 'Unlike thread' : 'Like thread'}
                icon={
                  <Icon
                    as={isLiked ? FaHeart : FaRegHeart}
                    color={isLiked ? 'red.500' : 'gray.400'}
                  />
                }
                sx={iconButtonStyles}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                isLoading={likeThread.isPending}
              />
              {likeCount > 0 && (
                <Text fontSize="sm" color="gray.600">
                  {likeCount}
                </Text>
              )}
              {showSettings && user && user.userId === thread.author.id && (
                <IconButton
                  aria-label="Thread settings"
                  icon={<Icon as={FaCog} color="gray.400" />}
                  sx={iconButtonStyles}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateModalOpen();
                  }}
                />
              )}
            </HStack>
          </HStack>
        </HStack>
        <Text sx={descriptionStyles}>{thread.description}</Text>
        {isExample && isExpanded && (
          <Box sx={contentBoxStyles}>
            <VStack align="stretch" spacing={4}>
              {thread.threadContents.map((content) => (
                <HStack key={content.id} align="start" spacing={4}>
                  <VStack sx={authorColumnStyles}>
                    <Text sx={emojiStyles} aria-label={content.author.nickname}>
                      {content.authorEmoji}
                    </Text>
                    <Text sx={authorNameStyles}>{content.author.nickname}</Text>
                  </VStack>
                  <Text sx={contentTextStyles}>{content.content}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
      {showSettings && user && user.userId === thread.author.id && (
        <UpdateThreadModal
          isOpen={isUpdateModalOpen}
          onClose={onUpdateModalClose}
          thread={thread}
        />
      )}
    </Box>
  );
};
