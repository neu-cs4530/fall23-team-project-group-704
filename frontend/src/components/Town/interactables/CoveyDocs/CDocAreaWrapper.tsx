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
import { CDocUserID, ICDocDocument } from '../../../../types/CoveyTownSocket';
import CovDocsAreaController from '../../../../classes/interactable/CovDocsAreaController';

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
  //  const documents = [document, document, document, document];
  const [signedIn, setSignedIn] = useState(false);
  const [pages, setPages] = useState(1);
  const [currentDocId, setCurrentDocId] = useState('');
  const [currentDocument, setCurrentDocument] = useState<ICDocDocument>({
    createdAt: new Date().toDateString(),
    owner: 'Some test name',
    docID: nanoid(),
    docName: 'UI-side default',
    editors: [],
    viewers: [],
    content: 'UI-side default content',
  });
  const [userID, setUserID] = useState<CDocUserID>('Ise');

  let covDocsAreaController: CovDocsAreaController | undefined = undefined;

  if (newConversation) {
    covDocsAreaController = coveyTownController.getCovDocsAreaController(newConversation);
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
    setPages(pages + 1);
  };

  const handleBackToDirectory = () => {
    setPages(2);
  };

  /** const getDocument = useCallback(async () => {
    if (covDocsAreaController)
      setCurrentDocument(await covDocsAreaController.getDocByID(currentDocId));
  }, [covDocsAreaController, currentDocId]);

  useEffect(() => {
    getDocument();
  }, [currentDocId, getDocument]);*/

  const generateTestingDoc = useCallback(async () => {
    if (covDocsAreaController) {
      const docid = await covDocsAreaController.addNewDocument(userID);
      setCurrentDocId(docid);
      setCurrentDocument(await covDocsAreaController.getDocByID(docid));
    }
  }, [covDocsAreaController, userID]);

  useEffect(() => {
    generateTestingDoc();
  }, [covDocsAreaController, generateTestingDoc, userID]);

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
        {pages === 2 && (
          <CDocDirectory documents={[currentDocument]} handleClick={handleDocument} />
        )}
        {pages === 3 && covDocsAreaController && (
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
