import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { Button, Modal, ModalContent, ModalFooter, ModalOverlay, useToast } from '@chakra-ui/react';
import CovDocsArea from '../CovDocsArea';
import CDocArea from './CDocArea';
import CDocSignin from './CDocSignin';
import { nanoid } from 'nanoid';
import CDocDirectory from './CDocDirectory';
import CDocument from './CDocument';
import { ICDocDocument } from '../../../../types/CoveyTownSocket';
export default function CDocAreaWrapper(): JSX.Element {
  const coveyTownController = useTownController();
  const newConversation = useInteractable<CovDocsArea>('cdocsArea');
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
  const [currentDocId, setCurrentDocId] = useState('');
  const [currentDocument, setCurrentDocument] = useState<ICDocDocument>({
    createdAt: new Date().toDateString(),
    owner: '',
    docID: '',
    docName: '',
    editors: [],
    viewers: [],
    content: '',
  });
  if (newConversation) {
    const covDocsAreaController = coveyTownController.getCovDocsAreaController(newConversation);
  }

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
    setCurrentDocId(docId);
  };

  const handleBackToDirectory = () => {
    setPages(2);
  };

  const getDocument = async () => {
    setCurrentDocument(await covDocsAreaController.getDocByID(currentDocId));
  };
  useEffect(() => {
    getDocument();
  });

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
        {pages === 2 && <CDocDirectory documents={documents} handleClick={handleDocument} />}
        {pages === 3 && (
          <CDocument
            document={currentDocument}
            controller={covDocsAreaController}
            handleBackToDirectory={handleBackToDirectory}></CDocument>
        )}
        <ModalFooter>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
