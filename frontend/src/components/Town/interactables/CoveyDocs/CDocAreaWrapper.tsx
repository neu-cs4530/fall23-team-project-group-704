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

// TODO: hook up to CovDocsAreaController events
// docUpdated -> need to set the currentDocument to the new one
// ownedDocsChanged -> change the ownedDocs state variable
// etc
export default function CDocAreaWrapper(): JSX.Element {
  const coveyTownController = useTownController();
  const newConversation = useInteractable<CovDocsArea>('cdocsArea');
  /** const document = {
    createdAt: new Date().toDateString(),
    owner: nanoid(),
    docID: 'fake_id',
    docName: 'my first document',
    editors: [],
    viewers: [],
    content: 'string',
  };*/
  //  const documents = [document, document, document, document];
  const [signedIn, setSignedIn] = useState(false);
  const [pages, setPages] = useState(1);
  const [currentDocId, setCurrentDocId] = useState('fake_frontend_id');
  const [currentDocument, setCurrentDocument] = useState<ICDocDocument>({
    createdAt: new Date().toDateString(),
    owner: 'Ise',
    docID: 'fake_frontend_id',
    docName: 'UI-side default',
    editors: [],
    viewers: [],
    content: 'UI-side default content',
  });
  const [ownedDocs, setOwnedDocs] = useState<ICDocDocument[]>([]);
  const [userID, setUserID] = useState<CDocUserID>('Ise');

  const [cDocAreaController, setCDocAreaController] = useState<CovDocsAreaController | undefined>(
    undefined,
  );

  const isOpen = newConversation !== undefined;

  // not sure what this does
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

  // callback passed to child component
  const handleSignin = () => {
    // await sign in/up user
    setPages(pages + 1);
  };

  // sets the current document and switches to the document editor
  const handleDocument = useCallback(
    async (docId: string) => {
      setCurrentDocId(docId);

      if (cDocAreaController) {
        setCurrentDocument(await cDocAreaController?.getDocByID(docId));
        setPages(pages + 1);
      }
    },
    [cDocAreaController, pages],
  );

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
    if (cDocAreaController) {
      const docid = await cDocAreaController.addNewDocument(userID);
      const doc = await cDocAreaController.getDocByID(docid);
      setOwnedDocs([doc]);
    }
  }, [cDocAreaController, userID]);

  // generate the testing doc whenever our cdocareacontroller becomes non null
  useEffect(() => {
    generateTestingDoc();
  }, [cDocAreaController, generateTestingDoc, userID]);

  // update the cdocareacontroller whenever our newConversation becomes non null
  useEffect(() => {
    if (newConversation)
      setCDocAreaController(coveyTownController.getCovDocsAreaController(newConversation));
  }, [coveyTownController, newConversation]);

  useEffect(() => {
    if (cDocAreaController !== undefined) {
      const updateDoument = async () => {
        //setEditors(cDocAreaController.viewers);
        //setViewers(cDocAreaController.editors);
        const result = await cDocAreaController.getDocByID(currentDocId);
        setCurrentDocument(result);
      };
      const newDocumentCreated = async () => {
        //setEditors(cDocAreaController.viewers);
        //setViewers(cDocAreaController.editors);
        const docIds = await cDocAreaController.getOwnedDocs(userID);
        const docs: Promise<ICDocDocument>[] = [];
        for (const id of docIds) {
          docs.push(cDocAreaController.getDocByID(id));
        }
        setOwnedDocs(await Promise.all(docs));
      };
      cDocAreaController.addListener('docUpdated', updateDoument);
      cDocAreaController.addListener('newDocumentCreated', newDocumentCreated);

      return () => {
        cDocAreaController.removeListener('docUpdated', updateDoument);
        cDocAreaController.removeListener('newDocumentCreated', newDocumentCreated);
      };
    }
  }, [cDocAreaController, coveyTownController, currentDocId, newConversation, userID]);

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
        {pages === 2 && <CDocDirectory documents={ownedDocs} handleClick={handleDocument} />}
        {pages === 3 && cDocAreaController && (
          <CDocument
            document={currentDocument}
            controller={cDocAreaController}
            handleBackToDirectory={handleBackToDirectory}></CDocument>
        )}
        <ModalFooter>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
