import { SystemStyleObject } from '@chakra-ui/react';

type StyleProps = {
  [key: string]: string | number | boolean | StyleProps;
};

export const cardStyles: StyleProps = {
  p: 6,
  borderRadius: 'lg',
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'orange.100',
  shadow: 'md',
  transition: 'all 0.2s',
  _hover: {
    transform: 'translateY(-2px)',
    shadow: 'lg',
    borderColor: 'orange.200',
  },
  cursor: 'pointer',
};

export const exampleCardStyles: StyleProps = {
  ...cardStyles,
  cursor: 'default',
  _hover: {},
};

export const titleStyles: StyleProps = {
  fontSize: 'xl',
  color: 'black',
  letterSpacing: 'tight',
  fontFamily: "'Merriweather', serif",
  fontWeight: 'bold',
};

export const descriptionStyles: StyleProps = {
  color: 'gray.600',
  fontSize: 'sm',
  fontStyle: 'italic',
  fontFamily: "'Inter', sans-serif",
};

export const contentBoxStyles: StyleProps = {
  p: 4,
  borderRadius: 'lg',
  bg: 'ivory',
  borderWidth: '1px',
  borderColor: 'orange.200',
  _hover: {
    bg: 'ivory',
    transition: 'background 0.2s',
  },
};

export const authorColumnStyles: StyleProps = {
  spacing: 1,
  align: 'center',
  w: '80px',
  flexShrink: 0,
  pr: 4,
  borderRight: '1px solid',
  borderColor: 'orange.200',
};

export const emojiStyles: StyleProps = {
  fontSize: '2xl',
  role: 'img',
  transition: 'all 0.2s',
  _hover: {
    transform: 'scale(1.2) rotate(5deg)',
    filter: 'brightness(1.1)',
  },
};

export const authorNameStyles: StyleProps = {
  fontSize: 'sm',
  color: 'orange.600',
  textAlign: 'center',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
  _hover: {
    color: 'red.500',
    textShadow: '0 0 1px rgba(0,0,0,0.1)',
  },
  transition: 'all 0.2s',
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

export const iconButtonStyles: StyleProps = {
  variant: 'ghost',
  colorScheme: 'orange',
};
