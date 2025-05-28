import {
  Box,
  Grid,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaBook, FaUsers, FaHeart, FaFire } from 'react-icons/fa';
import type { Thread } from '../api/types';
import { ThreadCard } from './ThreadCard';
import {
  gridStyles,
  skeletonBoxStyles,
  emptyStateBoxStyles,
  emptyStateIconStyles,
  emptyStateTextStyles,
} from './ThreadList.styles';

export interface ThreadListProps {
  threads: Thread[];
  isLoading?: boolean;
  type?: 'my' | 'others' | 'liked' | 'trending';
}

export const ThreadList = ({
  threads,
  isLoading = false,
  type = 'my',
}: ThreadListProps) => {
  if (isLoading) {
    return (
      <Grid sx={gridStyles}>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={skeletonBoxStyles}>
            <Skeleton height="24px" mb={4} />
            <SkeletonText noOfLines={3} spacing={4} />
          </Box>
        ))}
      </Grid>
    );
  }

  if (threads.length === 0) {
    const getEmptyStateContent = () => {
      switch (type) {
        case 'my':
          return {
            icon: FaBook,
            text: "You haven't created any stories yet. Start your first story!",
          };
        case 'liked':
          return {
            icon: FaHeart,
            text: "You haven't liked any stories from other users yet. Explore and like stories you enjoy!",
          };
        case 'trending':
          return {
            icon: FaFire,
            text: 'No trending stories at the moment. Check back later!',
          };
        case 'others':
        default:
          return {
            icon: FaUsers,
            text: 'No other stories available. All stories from other users are either liked by you or trending!',
          };
      }
    };

    const { icon, text } = getEmptyStateContent();

    return (
      <Box sx={emptyStateBoxStyles}>
        <VStack spacing={4} align="center">
          <Icon as={icon} sx={emptyStateIconStyles} />
          <Text sx={emptyStateTextStyles}>{text}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Grid sx={gridStyles}>
      {threads.map((thread) => (
        <Box key={thread.id}>
          <ThreadCard thread={thread} showSettings={type === 'my'} />
        </Box>
      ))}
    </Grid>
  );
};
