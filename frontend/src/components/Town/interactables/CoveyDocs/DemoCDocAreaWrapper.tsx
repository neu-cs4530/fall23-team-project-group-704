import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import CovDocsArea from '../CovDocsArea';
import CDocArea from './CDocArea';
import { TicTacToeArea } from '../TicTacToe/TicTacToeArea';
import { Omit_ConversationArea_type_ } from '../../../../generated/client';

export default function DemoCDocAreaWrapper(): JSX.Element {
  const coveyTownController = useTownController();
  const newConversation = useInteractable('cdocsArea');

  const isOpen = newConversation !== undefined;

  useEffect(() => {
    if (newConversation) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newConversation]);

  const closeModal = useCallback(() => {
    if (newConversation) {
      coveyTownController.interactEnd(newConversation);
    }
  }, [coveyTownController, newConversation]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a conversation in {newConversation?.name} </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel htmlFor='topic'>Topic of Conversation</FormLabel>
            <Input id='topic' placeholder='Share the topic of your conversation' name='topic' />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
