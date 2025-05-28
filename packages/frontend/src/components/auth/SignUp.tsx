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
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSignUp } from '../../api/hooks';
import { Link as RouterLink } from 'react-router-dom';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    nickname?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const toast = useToast();
  const navigate = useNavigate();
  const signUp = useSignUp();

  const validateForm = () => {
    const newErrors: {
      email?: string;
      nickname?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!nickname) {
      newErrors.nickname = 'Pen name is required';
    } else if (nickname.length < 2) {
      newErrors.nickname = 'Pen name must be at least 2 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signUp.mutateAsync({ email, nickname, password });
      toast({
        title: 'Account created successfully',
        description: 'Please sign in with your new account',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/signin');
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.response?.data?.message || 'Please try again',
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
          Sign Up
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

            <FormControl isInvalid={!!errors.nickname}>
              <FormLabel
                color="rgba(255, 255, 255, 0.9)"
                textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
              >
                Pen Name
              </FormLabel>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Choose a pen name"
                bg="rgba(255, 255, 255, 0.9)"
                color="gray.800"
                _placeholder={{ color: 'gray.500' }}
              />
              <FormErrorMessage color="red.300">
                {errors.nickname}
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

            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel
                color="rgba(255, 255, 255, 0.9)"
                textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
              >
                Confirm Password
              </FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                bg="rgba(255, 255, 255, 0.9)"
                color="gray.800"
                _placeholder={{ color: 'gray.500' }}
              />
              <FormErrorMessage color="red.300">
                {errors.confirmPassword}
              </FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="orange"
              width="full"
              isLoading={isLoading}
              loadingText="Creating account..."
            >
              Sign Up
            </Button>
          </VStack>
        </form>

        <Text
          textAlign="center"
          color="rgba(255, 255, 255, 0.9)"
          textShadow="1px 1px 2px rgba(0, 0, 0, 0.7)"
        >
          Already have an account?{' '}
          <Button
            variant="link"
            color="orange.300"
            onClick={() => navigate('/signin')}
            p={0}
            h="auto"
            fontWeight="normal"
          >
            Sign in
          </Button>
        </Text>
      </VStack>
    </Box>
  );
}
