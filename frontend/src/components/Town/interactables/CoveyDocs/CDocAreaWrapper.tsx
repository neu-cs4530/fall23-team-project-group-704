import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { Button, Modal, ModalContent, ModalFooter, ModalOverlay } from '@chakra-ui/react';
import CovDocsArea from '../CovDocsArea';
import CDocSignin from './CDocSignin';
import CDocDirectory from './CDocDirectory';
import CDocument from './CDocument';
import { CDocDocID, CDocUserID, ICDocDocument } from '../../../../types/CoveyTownSocket';
import CovDocsAreaController from '../../../../classes/interactable/CovDocsAreaController';
import CDocPermissions from './CDocPermissions';

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
  //  const [signedIn, setSignedIn] = useState(false);
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

  /**  const [owner, setOwner] = useState<CDocUserID>(currentDocument ? currentDocument.owner : '');
  const [editors, setEditors] = useState<CDocUserID[]>(
    currentDocument ? currentDocument.editors : [],
  );
  const [viewers, setViewers] = useState<CDocUserID[]>(
    currentDocument ? currentDocument.viewers : [],
  );*/

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

  const handleSignup = () => {
    setPages(pages + 1);
  };

  // sets the current document and switches to the document editor
  const handleDocument = useCallback(
    async (docId: string) => {
      setCurrentDocId(docId);
      alert('hello');
      if (cDocAreaController) {
        setCurrentDocument(await cDocAreaController?.getDocByID(docId));
        setPages(pages + 1);
      }
    },
    [cDocAreaController, pages],
  );
  const handleNewDoc = useCallback(async () => {
    if (cDocAreaController) {
      const newID = await cDocAreaController.addNewDocument(userID);
      setCurrentDocument(await cDocAreaController.getDocByID(newID));
      setPages(pages + 1);
    }
  }, [cDocAreaController, pages, userID]);

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
    setUserID('Ise');
    generateTestingDoc();
  }, [cDocAreaController, generateTestingDoc, userID]);

  // update the cdocareacontroller whenever our newConversation becomes non null
  useEffect(() => {
    if (newConversation)
      setCDocAreaController(coveyTownController.getCovDocsAreaController(newConversation));
  }, [coveyTownController, newConversation]);

  /**const handleChangePermissions = (permissions: {
    theOwner: string;
    theEditors: string[];
    theViewers: string[];
  }) => {
    //  setOwner(permissions.theOwner);
    //setEditors(permissions.theEditors);
    //setViewers(permissions.theViewers);
  };*/

  const handleClickPermissions = () => {
    setPages(4);
  };

  const handleExitPermissions = () => {
    setPages(3);
  };

  useEffect(() => {
    if (cDocAreaController !== undefined) {
      const updateDoument = async () => {
        //setEditors(cDocAreaController.viewers);
        //setViewers(cDocAreaController.editors);
        const result = await cDocAreaController.getDocByID(currentDocId);
        setCurrentDocument(result);
      };
      const newDocumentCreated = async (docid: CDocDocID, valid: boolean) => {
        //setEditors(cDocAreaController.viewers);
        //setViewers(cDocAreaController.editors);
        const docIds = await cDocAreaController.getOwnedDocs(userID);
        const docs: Promise<ICDocDocument>[] = [];
        for (const id of docIds) {
          docs.push(cDocAreaController.getDocByID(id));
        }
        setOwnedDocs(await Promise.all(docs));

        if (valid) {
          setCurrentDocId(docid);
          setCurrentDocument(await cDocAreaController.getDocByID(docid));
        }
      };
      cDocAreaController.addListener('docUpdated', updateDoument);
      cDocAreaController.addListener('newDocumentCreated', newDocumentCreated);

      return () => {
        cDocAreaController.removeListener('docUpdated', updateDoument);
        cDocAreaController.removeListener('newDocumentCreated', newDocumentCreated);
      };
    }
  }, [cDocAreaController, coveyTownController, currentDocId, newConversation, userID]);

  function handlePermissionsChanged(permissions: {
    theOwner: string;
    theEditors: string[];
    theViewers: string[];
  }): void {
    viewers = theViewers;
    throw new Error('Function not implemented.');
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        {pages === 1 && <CDocSignin signIn={handleSignin} signUp={handleSignup} />}
        {pages === 2 && (
          <CDocDirectory
            documents={ownedDocs}
            handleClick={handleDocument}
            handleClickPermissions={handleClickPermissions}
            handleNewDoc={handleNewDoc}
          />
        )}
        {pages === 3 && cDocAreaController && (
          <CDocument
            document={currentDocument}
            controller={cDocAreaController}
            handleBackToDirectory={handleBackToDirectory}
            handlePermissions={function (): void {
              throw new Error('Function not implemented.');
            }}></CDocument>
        )}
        {pages === 4 && (
          <CDocPermissions
            owner={currentDocument.owner}
            editors={currentDocument.editors}
            viewers={currentDocument.viewers}
            permissionsWereChanged={handlePermissionsChanged} //change this to a handlepermissionschanged
            handleExit={handleExitPermissions}></CDocPermissions>
        )}
        <ModalFooter>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
