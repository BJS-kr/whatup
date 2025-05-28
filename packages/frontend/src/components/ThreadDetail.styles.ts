import { SystemStyleObject } from '@chakra-ui/react';

type StyleProps = {
  [key: string]: string | number | boolean | StyleProps;
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
  color: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
};

export const subtitleStyles: StyleProps = {
  fontSize: { base: 'lg', md: 'xl' },
  color: 'orange.600',
  maxW: '2xl',
  mx: 'auto',
};

export const threadContainerStyles: StyleProps = {
  bg: 'white',
  borderRadius: 'lg',
  shadow: 'md',
  p: 6,
  mb: 8,
  borderWidth: '1px',
  borderColor: 'orange.100',
};

export const threadHeaderStyles: StyleProps = {
  mb: 6,
  pb: 4,
  borderBottom: '1px solid',
  borderColor: 'orange.200',
};

export const threadTitleStyles: StyleProps = {
  fontSize: '2xl',
  fontWeight: 'bold',
  mb: 2,
  color: 'orange.700',
};

export const threadMetaStyles: StyleProps = {
  fontSize: 'sm',
  color: 'orange.600',
};

export const threadContentStyles: StyleProps = {
  fontSize: 'lg',
  lineHeight: 'tall',
  color: 'gray.700',
  mb: 6,
};

export const threadFooterStyles: StyleProps = {
  pt: 4,
  borderTop: '1px solid',
  borderColor: 'orange.200',
};

export const actionButtonStyles: StyleProps = {
  variant: 'ghost',
  colorScheme: 'orange',
  size: 'sm',
  mr: 2,
};

export const commentContainerStyles: StyleProps = {
  bg: 'white',
  borderRadius: 'lg',
  shadow: 'md',
  p: 6,
  mb: 4,
  borderWidth: '1px',
  borderColor: 'orange.100',
};

export const commentHeaderStyles: StyleProps = {
  mb: 4,
  pb: 2,
  borderBottom: '1px solid',
  borderColor: 'orange.200',
};

export const commentAuthorStyles: StyleProps = {
  fontSize: 'md',
  fontWeight: 'bold',
  color: 'orange.700',
};

export const commentMetaStyles: StyleProps = {
  fontSize: 'sm',
  color: 'orange.600',
};

export const commentContentStyles: StyleProps = {
  fontSize: 'md',
  lineHeight: 'tall',
  color: 'gray.700',
  mb: 4,
};

export const commentFooterStyles: StyleProps = {
  pt: 2,
  borderTop: '1px solid',
  borderColor: 'orange.200',
};

export const commentFormStyles: StyleProps = {
  bg: 'white',
  borderRadius: 'lg',
  shadow: 'md',
  p: 6,
  mb: 8,
  borderWidth: '1px',
  borderColor: 'orange.100',
};

export const commentFormTitleStyles: StyleProps = {
  fontSize: 'xl',
  fontWeight: 'bold',
  mb: 4,
  color: 'orange.700',
};

export const submitButtonStyles: StyleProps = {
  colorScheme: 'orange',
  size: 'lg',
  w: 'full',
};

export const authorNameStyles: StyleProps = {
  fontSize: 'sm',
  color: 'orange.600',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
};

export const avatarStyles: StyleProps = {
  size: 'sm',
  bg: 'orange.500',
  color: 'white',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
};

export const backButtonStyles: StyleProps = {
  variant: 'ghost',
  colorScheme: 'orange',
  mb: 6,
};

export const authorInfoStyles: StyleProps = {
  opacity: 0,
  transform: 'translateY(10px)',
  transition: 'all 0.2s',
  fontFamily: "'Inter', sans-serif",
};

export const popoverContentStyles: StyleProps = {
  width: 'auto',
};

export const textareaStyles: StyleProps = {
  size: 'lg',
  minH: '200px',
};

export const contentBoxStyles: StyleProps = {
  p: 6,
  borderRadius: 'xl',
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'orange.100',
  shadow: 'md',
};

export const contentTextStyles: StyleProps = {
  color: 'gray.700',
  whiteSpace: 'pre-wrap',
  flex: '1',
  fontFamily: "'Inter', sans-serif",
  _hover: {
    color: 'gray.900',
    textShadow: '0 0 1px rgba(0,0,0,0.05)',
  },
  transition: 'all 0.2s',
};

export const descriptionStyles: StyleProps = {
  color: 'gray.600',
  fontSize: 'lg',
  fontFamily: "'Inter', sans-serif",
  mt: 2,
};
