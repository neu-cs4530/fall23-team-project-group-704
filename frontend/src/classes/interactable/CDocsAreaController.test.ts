export {};
describe('placeholder_test', () => {
  it('placeholder_test', () => {
    expect(true).toBeTruthy();
  });
});
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { ICDocArea, PlayerLocation, WinnableGameState } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import CDocsAreaController from './CDocsAreaController';
import TownController from '../TownController';
import CDocUserDataMap from './CDocUserDataMap';
describe('[T2] CBoardAreaController', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testArea: CDocsAreaController;
  let mockTownController: TownController;
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
      mockClear(mockTownController.sendInteractableCommand);
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
      await testArea.openDocument(testUser1, 'doc1');
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
        type: 'GetDoc',
        docid: 'doc1',
        userId: testUser1,
      });
    });
  });
  describe('getDocByID', () => {
    it('test calling getDocByID', async () => {
      mockClear(mockTownController.sendInteractableCommand);
      await testArea.getDocByID('doc1');
      expect(mockTownController).toHaveBeenCalledTimes(1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'GetDoc',
        docid: 'doc1',
      });
    });
  });
  describe('closeDocument', () => {
    it('test calling closeDocument', async () => {
      const testUser1 = nanoid();
      mockClear(mockTownController.sendInteractableCommand);
      await testArea.closeDocument('doc1');
      expect(mockTownController).toHaveBeenCalledTimes(1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'CloseDoc',
        id: 'doc1',
      });
    });
  });
  describe('getOwnedDocs', () => {
    it('test calling getOwnedDocs', async () => {
      const testUser1 = nanoid();
      mockClear(mockTownController.sendInteractableCommand);
      await testArea.getOwnedDocs(testUser1);
      expect(mockTownController).toHaveBeenCalledTimes(1);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(testArea.id, {
        type: 'GetOwnedDocs',
        userId: testUser1,
      });
    });
  });
  /*
  describe('updateFrom', () => {
    spyOn(testArea, 'updateFrom').and.callThrough();
    it('should update the document', async () => {
      const testUser1 = nanoid();
      const docMap: CDocUserDataMap = new CDocUserDataMap();
   
      const newModel: ICDocArea = {
        docMap: docMap.toData(),
        allRegisteredUsers: [],
        type: 'ConversationArea',
        id: 'fake_id',
        occupants: [],
      };
      testArea.updateFrom(newModel, []);
    });
    it('should throw exception if document does not exist', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      expect(async () => testArea.updateFrom(nanoid(), 'doc1')).toThrow(new Error());
    });
    */
});
