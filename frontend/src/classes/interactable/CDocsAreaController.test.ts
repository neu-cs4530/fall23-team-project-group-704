import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { ICDocArea, ICDocDocument } from '../../types/CoveyTownSocket';
import CDocsAreaController from './CDocsAreaController';
import TownController from '../TownController';
import { CDocUserData } from './CDocUserDataMap';
describe('[T2] CBoardAreaController', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testArea: CDocsAreaController;
  let mockTownController = mock<TownController>();
  beforeEach(() => {
    mockTownController = mock<TownController>();
    testArea = new CDocsAreaController(
      nanoid(),
      {
        docMap: [],
        allRegisteredUsers: [],
        type: 'CDocsArea',
        id: 'fake_id',
        occupants: [],
      },
      mockTownController,
    );
  });

  describe('createNewUser', () => {
    it('test calling createNewUser', async () => {
      const testUser1 = nanoid();
      const password = nanoid();
      mockClear(mockTownController.sendInteractableCommand);
      await testArea.createNewUser(testUser1, password);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'CreateNewUser',
        username: testUser1,
        password: password,
      });
    });
  });

  describe('addNewDocument', () => {
    it('test calling addNewDocument', async () => {
      const testUser1 = nanoid();
      mockTownController.sendInteractableCommand.mockImplementation(async () => {
        const doc: ICDocDocument = {
          createdAt: '',
          owner: '',
          docID: '',
          docName: '',
          editors: [],
          viewers: [],
          content: '',
        };
        return { doc: doc };
      });
      await testArea.addNewDocument(testUser1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'CreateNewDoc',
        id: testUser1,
      });
    });
  });

  describe('getOpenedDocument', () => {
    it('test calling getOpenedDocument', async () => {
      const testUser1 = nanoid();
      mockClear(mockTownController.sendInteractableCommand);

      const data: CDocUserData = {
        activeDoc: 'doc1',
        ownedDocs: ['doc1'],
        sharedDocsEdit: [],
        sharedDocsView: [],
      };
      const model: ICDocArea = {
        docMap: [[testUser1, data]],
        allRegisteredUsers: [],
        type: 'CDocsArea',
        id: '',
        occupants: [],
      };
      testArea.updateFrom(model, []);
      mockTownController.sendInteractableCommand.mockImplementation(async () => {
        const doc: ICDocDocument = {
          createdAt: '',
          owner: '',
          docID: '',
          docName: '',
          editors: [],
          viewers: [],
          content: '',
        };
        return { doc: doc };
      });

      //  await testArea.openDocument(testUser1, 'doc1');
      await testArea.getOpenedDocument(testUser1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'GetDoc',
        docid: 'doc1',
      });
    });
  });
  describe('openDocument', () => {
    it('test calling openDocument', async () => {
      const testUser1 = nanoid();
      mockClear(mockTownController.sendInteractableCommand);
      await testArea.openDocument(testUser1, 'doc1');
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'OpenDoc',
        docid: 'doc1',
        userid: testUser1,
      });
    });
  });
  describe('getDocByID', () => {
    it('test calling getDocByID', async () => {
      mockTownController.sendInteractableCommand.mockImplementation(async () => {
        const doc: ICDocDocument = {
          createdAt: '',
          owner: '',
          docID: '',
          docName: '',
          editors: [],
          viewers: [],
          content: '',
        };
        return { doc: doc };
      });

      await testArea.getDocByID('doc1');
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledTimes(1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'GetDoc',
        docid: 'doc1',
      });
    });
  });
  describe('closeDocument', () => {
    it('test calling closeDocument', async () => {
      mockClear(mockTownController.sendInteractableCommand);
      await testArea.closeDocument('doc1');
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledTimes(1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'CloseDoc',
        id: 'doc1',
      });
    });
  });
  describe('getOwnedDocs', () => {
    it('test calling getOwnedDocs', async () => {
      const testUser1 = nanoid();
      mockTownController.sendInteractableCommand.mockImplementation(async () => {
        const doc: ICDocDocument = {
          createdAt: '',
          owner: '',
          docID: '',
          docName: '',
          editors: [],
          viewers: [],
          content: '',
        };
        return { docs: [doc] };
      });

      await testArea.getOwnedDocs(testUser1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledTimes(1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'GetOwnedDocs',
        id: testUser1,
      });
    });
  });

  describe('updateFrom', () => {
    it('should call the document edited listener if it had the same active doc before and after', async () => {
      const testUser1 = nanoid();
      const data: CDocUserData = {
        activeDoc: 'doc1',
        ownedDocs: ['doc1'],
        sharedDocsEdit: [],
        sharedDocsView: [],
      };
      const model: ICDocArea = {
        docMap: [[testUser1, data]],
        allRegisteredUsers: [],
        type: 'CDocsArea',
        id: '',
        occupants: [],
      };

      const testingDoc: ICDocDocument = {
        createdAt: '',
        owner: testUser1,
        docID: 'doc1',
        docName: '',
        editors: [],
        viewers: [],
        content: '',
      };

      // mock this so sign in works
      mockTownController.sendInteractableCommand.mockImplementation(async () => {
        return { validation: true };
      });
      expect(await testArea.signInUser(testUser1, 'random password')).toBeTruthy();

      // mock this so getDocByID works
      mockTownController.sendInteractableCommand.mockImplementation(async () => {
        return { doc: testingDoc };
      });

      const listener = jest.fn(() => {});
      testArea.addListener('docUpdated', listener);
      //setEditors(cDocAreaController.viewers);
      // give them an active doc
      testArea.updateFrom(model, []);
      expect(listener).toHaveBeenCalledTimes(0);

      // give them the same active doc
      testArea.updateFrom(model, []);
      await new Promise(r => setTimeout(r, 500));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(testingDoc);
    });
  });
});
