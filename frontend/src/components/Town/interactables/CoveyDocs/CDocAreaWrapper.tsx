import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { Button, Modal, ModalContent, ModalFooter, ModalOverlay, useToast } from '@chakra-ui/react';
import CDocSignin from './CDocSignin';
import CDocDirectory from './CDocDirectory';
import CDocument from './CDocument';
import { CDocDocID, CDocUserID, ICDocDocument } from '../../../../types/CoveyTownSocket';
import CDocsAreaController from '../../../../classes/interactable/CDocsAreaController';
import CDocPermissions from './CDocPermissions';
import CDocsArea from '../CDocsArea';

// TODO: hook up to CDocsAreaController events
// docUpdated -> need to set the currentDocument to the new one
// ownedDocsChanged -> change the ownedDocs state variable
// etc
export default function CDocAreaWrapper(): JSX.Element {
  const coveyTownController = useTownController();
  const newConversation = useInteractable<CDocsArea>('cdocsArea');
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
  const toast = useToast();
  const [ownedDocs, setOwnedDocs] = useState<ICDocDocument[]>([]);
  const [userID, setUserID] = useState<CDocUserID>('Ise');

  const [cDocAreaController, setCDocAreaController] = useState<CDocsAreaController | undefined>(
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
  const handleSignin = async (username: string, password: string) => {
    // await sign in/up user
    setSignedIn((await cDocAreaController?.signInUser(username, password)) || false);

    if (signedIn) {
      setUserID(username);
      setPages(pages + 1);
    } else {
      toast({
        title: 'Error',
        description: 'Unable to sign in',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleSignup = async (username: string, password: string) => {
    try {
      await cDocAreaController?.createNewUser(username, password);
      setSignedIn((await cDocAreaController?.signInUser(username, password)) || false);
      if (signedIn) {
        setUserID(username);
        setPages(pages + 1);
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: e,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
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
      setOwnedDocs(
        await Promise.all(
          (
            await cDocAreaController.getOwnedDocs(userID)
          ).map(id => cDocAreaController.getDocByID(id)),
        ),
      );
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

  async function handlePermissionsChanged(permissions: {
    theOwner: string;
    theEditors: string[];
    theViewers: string[];
  }): Promise<void> {
    if (cDocAreaController === undefined) {
      throw new Error('no controller defined.');
    }
    if (currentDocument.viewers === undefined) {
      throw new Error('viewers array is undefined.');
    }
    if (currentDocument.editors === undefined) {
      throw new Error('editors array is undefined.');
    }
    if (currentDocument.owner === undefined) {
      throw new Error('owner is undefined.');
    }

    //for every user that should be given edit access
    for (const editor in permissions.theEditors) {
      //if the person was previously a viewer, remove their permission and add back as an editor
      if (currentDocument.viewers.filter(user => user === editor).length !== 0) {
        await cDocAreaController.removeUserFrom(currentDocId, editor);
        await cDocAreaController.shareDocWith(currentDocId, editor, 'EDIT');
      }
      //if the person was previously an editor, do nothing
      else if (currentDocument.editors.filter(user => user === editor).length !== 0) {
        //do nothing
      }
      //if the person previously previously had no access, add them as an editor
      //still have to implement this option through permissions ui
      else await cDocAreaController.shareDocWith(currentDocId, editor, 'EDIT');
    }

    //for every user that should be given view access
    for (const viewer in permissions.theViewers) {
      //if the person was previously an editor, remove their permission and add back as a viewer
      if (currentDocument.editors.filter(user => user === viewer).length !== 0) {
        await cDocAreaController.removeUserFrom(currentDocId, viewer);
        await cDocAreaController.shareDocWith(currentDocId, viewer, 'VIEW');
      }
      //if the person was previously a viewer, do nothing
      else if (currentDocument.viewers.filter(user => user === viewer).length !== 0) {
        //do nothing
      }
      //if the person previously previously had no access, add them as an viewer
      //still have to implement this option through permissions ui
      cDocAreaController.shareDocWith(currentDocId, viewer, 'VIEW');
    }

    //handling of transferring ownership -- keep?
    currentDocument.owner = permissions.theOwner; //have owndership?
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
            permissionsWereChanged={handlePermissionsChanged}
            handleExit={handleExitPermissions}></CDocPermissions>
        )}
        <ModalFooter>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
