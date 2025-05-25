import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Switch,
  Textarea,
  useToast,
  VStack,
  Text,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCreateThread } from '../api/hooks';
import { InfoIcon } from '@chakra-ui/icons';

export function CreateThread() {
  const navigate = useNavigate();
  const toast = useToast();
  const createThread = useCreateThread();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxLength: 1000,
    autoAccept: false,
    allowConsecutiveContribution: false,
    initialContent: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createThread.mutateAsync(formData);
      toast({
        title: 'Thread created',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error creating thread',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl">
          Create New Thread
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter thread title"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the direction of your story"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Maximum Length</FormLabel>
              <Input
                type="number"
                value={formData.maxLength}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxLength: parseInt(e.target.value),
                  })
                }
                min={100}
                max={5000}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <HStack spacing={0}>
                <FormLabel mb="0">Auto-accept new contributions</FormLabel>
                <Tooltip
                  label="When enabled, new contributions will be automatically accepted without requiring manual approval"
                  placement="top"
                >
                  <InfoIcon color="gray.500" />
                </Tooltip>
              </HStack>
              <Switch
                ml="10px"
                isChecked={formData.autoAccept}
                onChange={(e) =>
                  setFormData({ ...formData, autoAccept: e.target.checked })
                }
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <HStack spacing={0}>
                <FormLabel mb="0">Allow consecutive contributions</FormLabel>
                <Tooltip
                  label="When enabled, the same author can contribute multiple times in a row. When disabled, authors must wait for someone else to contribute before adding more content"
                  placement="top"
                >
                  <InfoIcon color="gray.500" />
                </Tooltip>
              </HStack>
              <Switch
                ml="10px"
                isChecked={formData.allowConsecutiveContribution}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allowConsecutiveContribution: e.target.checked,
                  })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Initial Content</FormLabel>
              <Textarea
                value={formData.initialContent}
                onChange={(e) =>
                  setFormData({ ...formData, initialContent: e.target.value })
                }
                placeholder="Start your story..."
                minH="200px"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="orange"
              size="lg"
              width="full"
              isLoading={createThread.isPending}
            >
              Create Thread
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
}
