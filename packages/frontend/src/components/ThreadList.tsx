import {
  Box,
  Grid,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaBook, FaUsers } from 'react-icons/fa';
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
  type?: 'my' | 'others';
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
    return (
      <Box sx={emptyStateBoxStyles}>
        <VStack spacing={4} align="center">
          <Icon
            as={type === 'my' ? FaBook : FaUsers}
            sx={emptyStateIconStyles}
          />
          <Text sx={emptyStateTextStyles}>
            {type === 'my'
              ? "You haven't created any threads yet. Start your first story!"
              : 'No threads from other users yet. Be the first to create one!'}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Grid sx={gridStyles}>
      {threads.map((thread) => (
        <Box key={thread.id}>
          <ThreadCard thread={thread} />
        </Box>
      ))}
    </Grid>
  );
};
