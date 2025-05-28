import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Textarea,
  VStack,
  HStack,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { useUpdateThread } from '../api/hooks';
import type { Thread, UpdateThreadDto } from '../api/types';

interface UpdateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: Thread;
}

export function UpdateThreadModal({
  isOpen,
  onClose,
  thread,
}: UpdateThreadModalProps) {
  const toast = useToast();
  const updateThread = useUpdateThread();

  const [formData, setFormData] = useState<UpdateThreadDto>({
    description: thread.description,
    maxLength: thread.maxLength,
    autoAccept: thread.autoAccept,
    allowConsecutiveContribution: thread.allowConsecutiveContribution,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateThread.mutateAsync({ id: thread.id, dto: formData });
      toast({
        title: 'Thread updated',
        description: 'Thread options have been updated successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error updating thread',
        description: 'Failed to update thread options. Please try again.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleClose = () => {
    // Reset form data to original values
    setFormData({
      description: thread.description,
      maxLength: thread.maxLength,
      autoAccept: thread.autoAccept,
      allowConsecutiveContribution: thread.allowConsecutiveContribution,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Thread Options</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Contribution Guidelines</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the direction of your story"
                  minH="100px"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Maximum Length per Contribution</FormLabel>
                <Input
                  type="number"
                  value={formData.maxLength}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxLength: parseInt(e.target.value) || 1000,
                    })
                  }
                  min={100}
                  max={5000}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <HStack spacing={0} flex={1}>
                  <FormLabel mb="0">Auto-accept new contributions</FormLabel>
                  <Tooltip
                    label="When enabled, new contributions will be automatically accepted without requiring manual approval"
                    placement="top"
                  >
                    <InfoIcon color="gray.500" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={formData.autoAccept}
                  onChange={(e) =>
                    setFormData({ ...formData, autoAccept: e.target.checked })
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <HStack spacing={0} flex={1}>
                  <FormLabel mb="0">Allow consecutive contributions</FormLabel>
                  <Tooltip
                    label="When enabled, the same author can contribute multiple times in a row. When disabled, authors must wait for someone else to contribute before adding more content"
                    placement="top"
                  >
                    <InfoIcon color="gray.500" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={formData.allowConsecutiveContribution}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowConsecutiveContribution: e.target.checked,
                    })
                  }
                />
              </FormControl>

              <Text fontSize="sm" color="gray.600" textAlign="center">
                Note: Thread title and initial contribution cannot be changed
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="orange"
              isLoading={updateThread.isPending}
              isDisabled={
                !formData.description.trim() ||
                formData.maxLength < 100 ||
                formData.maxLength > 5000
              }
            >
              Update Thread
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
