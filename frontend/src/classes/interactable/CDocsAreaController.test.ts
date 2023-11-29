export {};
describe('placeholder_test', () => {
  it('placeholder_test', () => {
    expect(true).toBeTruthy();
  });
});
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { ICDocArea, PlayerLocation, WinnableGameState } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import CDocsAreaController from './CDocsAreaController';
import TownController from '../TownController';
import CDocUserDataMap from './CDocUserDataMap';
describe('[T2] CBoardAreaController', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testArea: CDocsAreaController;
  beforeEach(() => {
    testArea = new CDocsAreaController(
      nanoid(),
      {
        docMap: [],
        allRegisteredUsers: [],
        type: 'CDocsArea',
        id: 'fake_id',
        occupants: [],
      },
      mock<TownController>(),
    );
  });
  /*
  describe('validatePastUser', () => {
    it('returns true if username and password match', () => {
      // somehow set up an existing list of users for testArea
      expect(testArea.validatePastUser('', '')).toEqual(true);
    });
    it('allows all methods to be used once validation is successful', () => {
      // somehow set up an existing list of users for testArea
      expect(testArea.validatePastUser('', '')).toEqual(true);
      // hopefully no exceptions will be thrown when the following methods are called
      testArea.addNewDocument();
      testArea.closeDocument();
      testArea.openDocument(nanoid());
    });
    it('returns false if username and password do not match', () => {
      // somehow set up an existing list of users for testArea
      expect(testArea.validatePastUser('', '')).toEqual(false);
    });
  });
  describe('createNewUser', () => {
    it('creates new user if user does not currently exist', () => {
      expect(testArea.validatePastUser('tester', 'passcode')).toEqual(false);
      testArea.createNewUser('tester', 'passcode');
      expect(testArea.validatePastUser('tester', 'passcode')).toEqual(true);
    });
    it('throws exception if user name is already taken', () => {
      expect(testArea.validatePastUser('tester', 'passcode')).toEqual(false);
      testArea.createNewUser('tester', 'passcode');
      expect(testArea.validatePastUser('tester', 'passcode')).toEqual(true);

      // now try creating the user again
      expect(() => testArea.createNewUser('tester', 'passcode_')).toThrow(Error());
    });
  });
  describe('addNewDocument', () => {
    it('throws exception if not signed in', () => {
      expect(() => testArea.addNewDocument()).toThrow(new Error());
    });
    it('creates new id for each new document', async () => {
      const id1 = await testArea.addNewDocument();
      const id2 = await testArea.addNewDocument();

      expect(id1 != id2).toBeTruthy();
    });
  });
  */
  describe('getOpenedDocument', () => {
    it('a new document opens as empty', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      await testArea.openDocument(testUser1, id1);
      const content = await testArea.getOpenedDocument(testUser1);
      expect(content).toEqual('');
    });
    it('an existing document opens as it should be', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      await testArea.openDocument(testUser1, id1);
      await testArea.writeToDoc(id1, 'stuff');
      const content = await testArea.getOpenedDocument(id1);
      expect(content).toEqual('stuff');
    });
    it('throws exception if no document is open', async () => {
      const testUser1 = nanoid();
      expect(async () => testArea.getOpenedDocument(testUser1)).toThrow(
        new Error('No active document'),
      );
    });
  });
  describe('openDocument', () => {
    it('should open the right document', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      await testArea.openDocument(testUser1, id1);
      await testArea.writeToDoc(id1, 'doc1');

      expect(await testArea.getOpenedDocument(testUser1)).toEqual('doc1');
    });
    it('should throw exception if a document is already open', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      await testArea.openDocument(testUser1, id1);
      expect(await testArea.openDocument(testUser1, id1)).toThrow(new Error());
    });
  });
  describe('getOpenedDocument', () => {
    it('return current open document', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      await testArea.openDocument(testUser1, id1);
      await testArea.writeToDoc(id1, 'doc1');
      expect(await testArea.getOpenedDocument(testUser1)).toEqual('doc1');
    });
    it('throws exception if no document is open', async () => {
      const testUser1 = nanoid();
      expect(async () => testArea.getOpenedDocument(testUser1)).toThrow(new Error());
    });
  });
  describe('getDocByID', () => {
    it('should return the right document', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      const id2 = await testArea.addNewDocument(testUser1);
      await testArea.openDocument(testUser1, id1);
      await testArea.writeToDoc(id1, 'doc1');

      expect(await testArea.getDocByID(id1)).toEqual('doc1');
    });
    it('should throw exception if document does not exist', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      expect(async () => testArea.getDocByID(nanoid())).toThrow(new Error());
    });
  });
  describe('closeDocument', () => {
    it('should successfully close the right document', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      const id2 = await testArea.addNewDocument(testUser1);
      await testArea.openDocument(testUser1, id1);
      await testArea.writeToDoc(id1, 'doc1');
      const contentDoc1 = await (await testArea.getDocByID(id1)).content;
      expect(await testArea.getOpenedDocument(testUser1)).toEqual(contentDoc1);
      await testArea.closeDocument(id1);
      expect(async () => testArea.getOpenedDocument(testUser1)).toThrow(new Error());
    });
    it('should throw exception if no document is open', async () => {
      const testUser1 = nanoid();
      const id1 = await testArea.addNewDocument(testUser1);
      expect(async () => testArea.closeDocument(id1)).toThrow(new Error());
    });
  });
  describe('getOwnedDocs', () => {
    it('should return the right documents', async () => {
      const userid1 = nanoid();
      const id1 = await testArea.addNewDocument(userid1);
      const id2 = await testArea.addNewDocument(userid1);
      const id3 = await testArea.addNewDocument(userid1);

      expect(await testArea.getOwnedDocs(userid1)).toEqual([id1, id2, id3]);
    });

    it('should return empty list if no documents are owned by the user', async () => {
      const testUser = nanoid();
      expect(async () => testArea.getOwnedDocs(testUser)).totoEqual([]);
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
    });*/
});
