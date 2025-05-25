import {
  Box,
  Heading,
  Text,
  HStack,
  IconButton,
  useToast,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaChevronDown } from 'react-icons/fa';
import type { Thread } from '../api/types';
import { useState } from 'react';
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
}

export const ThreadCard = ({
  thread,
  isExample = false,
  onLike,
}: ThreadCardProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = () => {
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

    if (onLike) {
      onLike(thread.id);
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
          <HStack>
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
            <IconButton
              aria-label="Like thread"
              icon={<Icon as={FaHeart} color="red.500" />}
              sx={iconButtonStyles}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            />
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
    </Box>
  );
};
