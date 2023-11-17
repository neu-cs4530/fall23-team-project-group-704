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
import CDocSignin from './CDocSignin';
import { nanoid } from 'nanoid';
import CDocDirectory from './CDocDirectory';

export default function DemoCDocAreaWrapper(): JSX.Element {
  const coveyTownController = useTownController();
  const newConversation = useInteractable('cdocsArea');
  const document = {
    createdAt: new Date().toDateString(),
    owner: nanoid(),
    docID: nanoid(),
    docName: 'my first document',
    editors: [],
    viewers: [],
    content: 'string',
  };
  const documents = [document, document, document, document];
  const [signedIn, setSignedIn] = useState(false);
  const [pages, setPages] = useState(1);

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

  const handleSignin = () => {
    // await sign in/up user
    setPages(pages + 1);
  };

  const handleDocument = (docId: string) => {
    coveyTownController.getCovDocsAreaController().getDocByID(docId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        {pages === 1 && <CDocSignin signIn={handleSignin} />}
        {pages === 2 && <CDocDirectory documents={documents} />}
        <ModalFooter>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
