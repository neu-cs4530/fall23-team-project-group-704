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

  const updateOwnedDocs = useCallback(
    async (user: CDocUserID) => {
      if (cDocAreaController) {
        const docIds = cDocAreaController.getOwnedDocs(user);
        const getEdit = cDocAreaController.getDocsSharedWith(user, 'EDIT');
        const getView = cDocAreaController.getDocsSharedWith(user, 'VIEW');
        const allDocIDS = await Promise.all([docIds, getEdit, getView]);
        const docs: Promise<ICDocDocument>[] = [];
        for (const idList of allDocIDS) {
          for (const id of idList) docs.push(cDocAreaController.getDocByID(id));
        }
        setOwnedDocs(await Promise.all(docs));
      }
    },
    [cDocAreaController],
  );

  // callback passed to child component
  const handleSignin = async (username: string, password: string) => {
    // await sign in/up user
    if (cDocAreaController) {
      const success = await cDocAreaController.signInUser(username, password);

      if (success) {
        setUserID(username);
        await updateOwnedDocs(username);
        setPages(2);
      } else {
        toast({
          title: 'Unable to sign in - check credentials',
          description: 'Unable to sign in',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  const handleSignup = async (username: string, password: string) => {
    if (cDocAreaController) {
      try {
        await cDocAreaController.createNewUser(username, password);
        await handleSignin(username, password);
      } catch (e) {
        toast({
          title: 'Unable to sign up - username may already be taken',
          description: e,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  // sets the current document and switches to the document editor
  const handleDocument = useCallback(
    async (docId: string) => {
      setCurrentDocId(docId);
      if (cDocAreaController) {
        await cDocAreaController.openDocument(userID, docId);
        setCurrentDocument(await cDocAreaController.getDocByID(docId));
        setPages(pages + 1);
      }
    },
    [cDocAreaController, pages, userID],
  );
  const handleNewDoc = useCallback(async () => {
    if (cDocAreaController) {
      const newID = await cDocAreaController.addNewDocument(userID);
      await cDocAreaController.openDocument(userID, newID);
      setCurrentDocument(await cDocAreaController.getDocByID(newID));
      await updateOwnedDocs(userID);
      setPages(pages + 1);
    }
  }, [cDocAreaController, pages, updateOwnedDocs, userID]);

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

  /**  const generateTestingDoc = useCallback(async () => {
    if (cDocAreaController) {
      const docid = await cDocAreaController.addNewDocument(userID);
      const doc = await cDocAreaController.getDocByID(docid);
      setOwnedDocs([doc]);
    }
  }, [cDocAreaController, userID]);*/

  // generate the testing doc whenever our cdocareacontroller becomes non null
  // useEffect(() => {
  // setUserID('Ise');
  //generateTestingDoc();
  //}, [cDocAreaController, generateTestingDoc, userID]);

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

  const handleClickPermissions = async (docID: CDocDocID) => {
    if (cDocAreaController) {
      await cDocAreaController.openDocument(userID, docID);
      setCurrentDocId(docID);
      setCurrentDocument(await cDocAreaController.getDocByID(docID));
      setPages(4);
    }
  };

  const handleExitPermissions = () => {
    setPages(2);
  };

  useEffect(() => {
    if (cDocAreaController !== undefined) {
      const updateDoument = (doc: ICDocDocument) => {
        //setEditors(cDocAreaController.viewers);
        //setViewers(cDocAreaController.editors);
        setCurrentDocument(doc);
      };
      const newDocumentCreated = async (docid: CDocDocID, valid: boolean) => {
        //setEditors(cDocAreaController.viewers);
        //setViewers(cDocAreaController.editors);
        await updateOwnedDocs(userID);

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
  }, [
    cDocAreaController,
    coveyTownController,
    currentDocId,
    newConversation,
    updateOwnedDocs,
    userID,
  ]);

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
    for (const editor of permissions.theEditors) {
      //if the person was previously a viewer, remove their permission and add back as an editor
      if (
        currentDocument.viewers.find(user => user === editor) !== undefined ||
        currentDocument.editors.find(user => user === editor) !== undefined
      ) {
        await cDocAreaController.removeUserFrom(currentDocId, editor);
      }
      //if the person previously previously had no access, add them as an editor
      //still have to implement this option through permissions ui
      else await cDocAreaController.shareDocWith(currentDocId, editor, 'EDIT');
    }

    //for every user that should be given view access
    for (const viewer of permissions.theViewers) {
      //if the person was previously an editor, remove their permission and add back as a viewer
      if (
        currentDocument.editors.find(user => user === viewer) !== undefined ||
        currentDocument.viewers.find(user => user === viewer) !== undefined
      ) {
        await cDocAreaController.removeUserFrom(currentDocId, viewer);
      }
      //if the person previously previously had no access, add them as an viewer
      //still have to implement this option through permissions ui
      await cDocAreaController.shareDocWith(currentDocId, viewer, 'VIEW');
    }

    //handling of transferring ownership -- keep?
    currentDocument.owner = permissions.theOwner; //have owndership?
  }

  return (
    <Modal
      size={'full'}
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
            currentUser={userID}
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
