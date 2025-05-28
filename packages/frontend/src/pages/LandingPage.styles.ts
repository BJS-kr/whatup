import { keyframes } from '@emotion/react';

export const floatingAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

export const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 0.5; }
`;

export const containerStyles = {
  maxW: 'container.xl',
  py: 8,
};

export const headerStyles = {
  textAlign: 'center',
  mb: 12,
  position: 'relative',
  _before: {
    content: '""',
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '4px',
    background: 'linear-gradient(90deg, purple.400, pink.400, orange.400)',
    borderRadius: '2px',
  },
};

export const titleStyles = {
  as: 'h1',
  fontSize: '6xl',
  bgGradient: 'linear(to-r, red.500, orange.500)',
  bgClip: 'text',
  fontWeight: 'extrabold',
  fontFamily: "'Inter', sans-serif",
};

export const subtitleStyles = {
  fontSize: 'xl',
  color: 'rgba(255, 255, 255, 0.9)',
  maxW: '2xl',
  mx: 'auto',
  fontFamily: "'Inter', sans-serif",
  lineHeight: 'tall',
  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
};

export const sectionStyles = {
  p: 8,
  borderRadius: 'xl',
  bg: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderWidth: '1px',
  borderColor: 'purple.100',
  shadow: 'xl',
};

export const sectionTitleStyles = {
  size: 'lg',
  bgGradient: 'linear(to-r, orange.500, orange.600)',
  bgClip: 'text',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
};

export const sectionTextStyles = {
  color: 'gray.600',
  fontSize: 'lg',
  fontFamily: "'Inter', sans-serif",
};

export const gridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
  gap: 6,
  justifyItems: 'center',
  alignItems: 'start',
};

export const storyBoxStyles = {
  p: 6,
  borderWidth: '1px',
  borderRadius: 'xl',
  bg: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderColor: 'orange.100',
  position: 'relative',
  overflow: 'hidden',
};

export const storyTitleStyles = {
  fontSize: 'xl',
  color: 'orange.600',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
};

export const storyCardStyles = {
  p: 4,
  borderRadius: 'lg',
  bg: 'ivory',
  borderWidth: '1px',
  borderColor: 'orange.200',
  transition: 'all 0.2s',
  _hover: {
    transform: 'translateY(-2px)',
    shadow: 'md',
    borderColor: 'orange.300',
    bg: 'ivory',
  },
};

export const storyCardTitleStyles = {
  color: 'orange.700',
  fontWeight: 'bold',
  mb: 2,
  fontFamily: "'Inter', sans-serif",
};

export const storyCardTextStyles = {
  color: 'gray.600',
  fontSize: 'sm',
  fontFamily: "'Inter', sans-serif",
  lineHeight: 'tall',
};

export const connectorLineStyles = {
  position: 'absolute',
  top: '50%',
  left: '250px',
  width: '70px',
  height: '2px',
  bg: 'orange.200',
  transform: 'translateY(-50%)',
};

export const ctaBoxStyles = {
  p: 8,
  borderRadius: 'xl',
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'gray.200',
  shadow: 'lg',
  flex: '1',
};

export const ctaTitleStyles = {
  size: 'xl',
  bgGradient: 'linear(to-r, purple.400, pink.400)',
  bgClip: 'text',
  textAlign: 'center',
  fontFamily: "'Inter', sans-serif",
};

export const ctaTextStyles = {
  textAlign: 'center',
  color: 'gray.600',
  fontFamily: "'Inter', sans-serif",
};

export const buttonGroupStyles = {
  spacing: 4,
  justify: 'center',
  display: 'flex',
  width: '100%',
  mt: 4,
  flexWrap: 'wrap',
  justifyContent: 'center',
};
