import {
  Box,
  Flex,
  HStack,
  Button,
  Icon,
  useColorModeValue,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Heading,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useSignOut } from '../api/hooks';
import { useUnreadNoticesCount } from '../hooks/useNotices';

export const Navigation = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { mutate: signOut } = useSignOut();
  const { data: unreadCount = 0 } = useUnreadNoticesCount(isAuthenticated);

  const handleSignOut = () => {
    signOut();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      px={4}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <RouterLink to="/">
            <Heading
              size="md"
              bgGradient="linear(to-r, red.500, orange.500)"
              bgClip="text"
              fontFamily="'Inter', sans-serif"
            >
              Cows
            </Heading>
          </RouterLink>
        </HStack>

        <HStack spacing={4}>
          {isAuthenticated ? (
            <>
              <Menu>
                <MenuButton>
                  <HStack spacing={2}>
                    <Box position="relative">
                      <Avatar size="sm" name={user?.nickname} bg="orange.500" />
                      {unreadCount > 0 && (
                        <Badge
                          position="absolute"
                          top="-1"
                          right="-1"
                          bg="red.500"
                          color="white"
                          borderRadius="full"
                          fontSize="xs"
                          minW="18px"
                          h="18px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Box>
                    <Text>{user?.nickname}</Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => navigate('/notices')}>
                    <Icon as={FaBell} mr={2} />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge
                        ml={2}
                        bg="red.500"
                        color="white"
                        borderRadius="full"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    <Icon as={FaSignOutAlt} mr={2} />
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                to="/signin"
                variant="ghost"
                colorScheme="orange"
              >
                Sign In
              </Button>
              <Button as={RouterLink} to="/signup" colorScheme="red">
                Sign Up
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};
