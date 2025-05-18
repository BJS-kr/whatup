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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCreateThread } from '../api/hooks';

export function CreateThread() {
  const navigate = useNavigate();
  const toast = useToast();
  const createThread = useCreateThread();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxLength: 1000,
    autoAccept: false,
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
      <Stack spacing={8}>
        <Heading>Create New Thread</Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <Stack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Maximum Content Length</FormLabel>
              <Input
                type="number"
                value={formData.maxLength}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxLength: parseInt(e.target.value),
                  })
                }
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Auto-accept new content</FormLabel>
              <Switch
                isChecked={formData.autoAccept}
                onChange={(e) =>
                  setFormData({ ...formData, autoAccept: e.target.checked })
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
                minH="200px"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={createThread.isPending}
              loadingText="Creating..."
            >
              Create Thread
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
