import { SystemStyleObject } from '@chakra-ui/react';

type StyleProps = {
  [key: string]: string | number | boolean | StyleProps;
};

export const gridStyles: StyleProps = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 6,
  width: '100%',
};

export const skeletonBoxStyles: StyleProps = {
  p: 6,
  borderRadius: 'lg',
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'gray.200',
  shadow: 'md',
};

export const emptyStateBoxStyles: StyleProps = {
  p: 8,
  borderRadius: 'lg',
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'gray.200',
  shadow: 'sm',
};

export const emptyStateIconStyles: StyleProps = {
  w: 12,
  h: 12,
  color: 'purple.500',
  opacity: 0.5,
};

export const emptyStateTextStyles: StyleProps = {
  fontSize: 'lg',
  color: 'gray.600',
  textAlign: 'center',
};

export const containerStyles: StyleProps = {
  maxW: '1200px',
  mx: 'auto',
  px: 4,
  py: 8,
};

export const headerStyles: StyleProps = {
  mb: 8,
  textAlign: 'center',
};

export const titleStyles: StyleProps = {
  fontSize: { base: '3xl', md: '4xl' },
  fontWeight: 'bold',
  mb: 4,
  bgGradient: 'linear(to-r, red.500, orange.500)',
  bgClip: 'text',
  color: 'transparent',
};

export const subtitleStyles: StyleProps = {
  fontSize: { base: 'lg', md: 'xl' },
  color: 'orange.600',
  maxW: '2xl',
  mx: 'auto',
};

export const filterContainerStyles: StyleProps = {
  mb: 8,
  p: 4,
  bg: 'white',
  borderRadius: 'lg',
  shadow: 'sm',
  borderWidth: '1px',
  borderColor: 'orange.100',
};

export const filterTitleStyles: StyleProps = {
  fontSize: 'lg',
  fontWeight: 'bold',
  mb: 4,
  color: 'orange.600',
};

export const filterButtonStyles: StyleProps = {
  variant: 'ghost',
  colorScheme: 'orange',
  size: 'sm',
  mr: 2,
  mb: 2,
};

export const activeFilterButtonStyles: StyleProps = {
  ...filterButtonStyles,
  bg: 'orange.100',
  color: 'orange.700',
  _hover: {
    bg: 'orange.200',
  },
};

export const threadListStyles: StyleProps = {
  spacing: 6,
};

export const emptyStateStyles: StyleProps = {
  textAlign: 'center',
  py: 12,
  color: 'orange.600',
};

export const loadMoreButtonStyles: StyleProps = {
  mt: 8,
  colorScheme: 'orange',
  size: 'lg',
  w: 'full',
  maxW: '300px',
  mx: 'auto',
  display: 'block',
};
