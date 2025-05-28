import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSignIn } from '../../api/hooks';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const toast = useToast();
  const navigate = useNavigate();
  const signIn = useSignIn();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn.mutateAsync({ email, password });
      toast({
        title: 'Signed in successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description:
          error.response?.data?.message || 'Please check your credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg">
      <VStack spacing={6} align="stretch">
        <Heading
          size="lg"
          textAlign="center"
          color="rgba(255, 255, 255, 0.9)"
          textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
        >
          Sign In
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel
                color="rgba(255, 255, 255, 0.9)"
                textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
              >
                Email
              </FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                bg="rgba(255, 255, 255, 0.9)"
                color="gray.800"
                _placeholder={{ color: 'gray.500' }}
              />
              <FormErrorMessage color="red.300">
                {errors.email}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel
                color="rgba(255, 255, 255, 0.9)"
                textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
              >
                Password
              </FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                bg="rgba(255, 255, 255, 0.9)"
                color="gray.800"
                _placeholder={{ color: 'gray.500' }}
              />
              <FormErrorMessage color="red.300">
                {errors.password}
              </FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="orange"
              width="full"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </VStack>
        </form>

        <Text
          textAlign="center"
          color="rgba(255, 255, 255, 0.9)"
          textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
        >
          Don't have an account?{' '}
          <ChakraLink as={RouterLink} to="/signup" color="orange.300">
            Sign up
          </ChakraLink>
        </Text>
      </VStack>
    </Box>
  );
}
